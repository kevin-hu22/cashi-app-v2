/* eslint-disable import/no-unresolved */
// src/screens/main/ExportScreen.js
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
    Alert,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Container from '../../components/layout/Container';
import { useSales } from '../../context/SalesContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ExportScreen = ({ route, navigation }) => {
  const { todaySales } = useSales();
  const [exportType, setExportType] = useState(route.params?.preselectedType || 'csv');
  const [dateRange, setDateRange] = useState({
    start: route.params?.dateRange?.start || new Date(),
    end: route.params?.dateRange?.end || new Date(),
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const exportFormats = [
    {
      id: 'csv',
      name: 'CSV',
      icon: 'document-text',
      description: 'Compatible con Excel',
    },
    {
      id: 'pdf',
      name: 'PDF',
      icon: 'document',
      description: 'Formato de impresión',
    },
    {
      id: 'json',
      name: 'JSON',
      icon: 'code',
      description: 'Datos estructurados',
    },
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportType) {
        case 'csv':
          content = generateCSV();
          filename = `ventas_${formatDate(new Date(), 'short').replace(/\//g, '-')}.csv`;
          mimeType = 'text/csv';
          break;
        case 'pdf':
          await generateAndSharePDF();
          setLoading(false);
          return;
        case 'json':
          content = generateJSON();
          filename = `ventas_${formatDate(new Date(), 'short').replace(/\//g, '-')}.json`;
          mimeType = 'application/json';
          break;
      }

      // Guardar archivo
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Compartir archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: 'Exportar Ventas',
        });
      } else {
        Alert.alert('Error', 'No se puede compartir en este dispositivo');
      }
    } catch (error) {
      console.error('Error exportando:', error);
      Alert.alert('Error', 'No se pudo exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Fecha,Hora,Producto,Cantidad,Valor,Tipo de Pago'];
    
    const rows = todaySales.map(sale => {
      const date = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
      return [
        formatDate(date, 'short'),
        date.toLocaleTimeString('es-CO'),
        sale.productName,
        sale.quantity,
        sale.saleValue,
        sale.paymentType === 'cash' ? 'Efectivo' : 'Transferencia',
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const generateJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      totalSales: todaySales.length,
      totalAmount: todaySales.reduce((sum, sale) => sum + sale.saleValue, 0),
      sales: todaySales.map(sale => ({
        ...sale,
        createdAt: sale.createdAt instanceof Date 
          ? sale.createdAt.toISOString() 
          : sale.createdAt,
      })),
    };

    return JSON.stringify(data, null, 2);
  };

  const generateAndSharePDF = async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Ventas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0379AF; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0379AF; color: white; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Ventas</h1>
          <p>Fecha: ${formatDate(new Date(), 'long')}</p>
          <p>Total de ventas: ${todaySales.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Valor</th>
                <th>Tipo de Pago</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              ${todaySales.map(sale => `
                <tr>
                  <td>${sale.productName}</td>
                  <td>${sale.quantity}</td>
                  <td>${formatCurrency(sale.saleValue)}</td>
                  <td>${sale.paymentType === 'cash' ? 'Efectivo' : 'Transferencia'}</td>
                  <td>${new Date(sale.createdAt).toLocaleTimeString('es-CO')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p class="total">
            Total: ${formatCurrency(todaySales.reduce((sum, sale) => sum + sale.saleValue, 0))}
          </p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar Reporte PDF',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Exportando datos..." />;
  }

  return (
    <Container scrollable>
      <View className="px-5 py-4">
        {/* Selector de formato */}
        <Card>
          <Text className="font-inter font-bold text-[#00151F] text-lg mb-4">
            Formato de Exportación
          </Text>
          
          {exportFormats.map((format) => (
            <TouchableOpacity
              key={format.id}
              className={`flex-row items-center p-3 rounded-lg mb-2 ${
                exportType === format.id ? 'bg-[#E8F1F3]' : ''
              }`}
              onPress={() => setExportType(format.id)}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center ${
                exportType === format.id ? 'bg-[#0379AF]' : 'bg-gray-200'
              }`}>
                <Ionicons
                  name={format.icon}
                  size={20}
                  color={exportType === format.id ? '#FFFFFF' : '#6B7280'}
                />
              </View>
              <View className="flex-1 ml-3">
                <Text className={`font-inter font-medium ${
                  exportType === format.id ? 'text-[#0379AF]' : 'text-[#00151F]'
                }`}>
                  {format.name}
                </Text>
                <Text className="font-inter text-xs text-gray-500">
                  {format.description}
                </Text>
              </View>
              {exportType === format.id && (
                <Ionicons name="checkmark-circle" size={24} color="#0379AF" />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Selector de fechas */}
        <Card className="mt-4">
          <Text className="font-inter font-bold text-[#00151F] text-lg mb-4">
            Rango de Fechas
          </Text>
          
          <TouchableOpacity
            className="flex-row items-center justify-between p-3 bg-[#F8F8F8] rounded-lg mb-3"
            onPress={() => setShowStartPicker(true)}
          >
            <Text className="font-inter text-gray-600">Desde:</Text>
            <View className="flex-row items-center">
              <Text className="font-inter text-[#00151F] mr-2">
                {formatDate(dateRange.start, 'medium')}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center justify-between p-3 bg-[#F8F8F8] rounded-lg"
            onPress={() => setShowEndPicker(true)}
          >
            <Text className="font-inter text-gray-600">Hasta:</Text>
            <View className="flex-row items-center">
              <Text className="font-inter text-[#00151F] mr-2">
                {formatDate(dateRange.end, 'medium')}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Resumen de datos */}
        <Card className="mt-4 bg-[#E8F1F3]">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={24} color="#0379AF" />
            <View className="flex-1 ml-3">
              <Text className="font-inter font-medium text-[#00151F]">
                Datos a exportar
              </Text>
              <Text className="font-inter text-sm text-gray-600 mt-1">
                {todaySales.length} ventas encontradas
              </Text>
              <Text className="font-inter text-sm text-gray-600">
                Total: {formatCurrency(todaySales.reduce((sum, sale) => sum + sale.saleValue, 0))}
              </Text>
            </View>
          </View>
        </Card>

        {/* Botones de acción */}
        <View className="mt-6">
          <Button
            title="Exportar"
            onPress={handleExport}
            size="lg"
            className="mb-3"
          />
          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="lg"
          />
        </View>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={dateRange.start}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) {
              setDateRange({ ...dateRange, start: date });
            }
          }}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          value={dateRange.end}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) {
              setDateRange({ ...dateRange, end: date });
            }
          }}
        />
      )}
    </Container>
  );
};

export default ExportScreen;