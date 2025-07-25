import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
    
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    timeZone: 'Asia/Jakarta'; 
  }
  return new Date(dateString).toLocaleDateString('id-ID', options);
};


const getFinancialReport = asyncHandler(async (req, res) => {
  console.log('[FinancialReportController] === Entering getFinancialReport function ===');
  try {
    console.log('[FinancialReportController] Step 1: Attempting to fetch completed orders...');
  
    const completedOrders = await Order.find({ orderStatus: 'Completed' });
  

    console.log(`[FinancialReportController] Step 2: Successfully fetched ${completedOrders.length} completed orders.`);

    console.log('[FinancialReportController] Step 3: Attempting to aggregate report summary...');
    const reportSummary = await Order.aggregate([
      { $match: { orderStatus: 'Completed' } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    console.log('[FinancialReportController] Step 4: Successfully aggregated report summary:', reportSummary.length, 'entries.');

    if (completedOrders.length > 0) {
      console.log('[FinancialReportController] Step 5: Inspecting first 3 completed orders (if any):');
      completedOrders.slice(0, 3).forEach((order, idx) => {
        console.log(`  Order ${idx + 1}: ID=${order._id}, User ID (raw)=${order.user}, Total=${order.totalPrice}, Items=${order.orderItems.length}`);
        if (order.orderItems && order.orderItems.length > 0) {
          console.log(`    First item: Name=${order.orderItems[0].name}, Qty=${order.orderItems[0].quantity}, Price=${order.orderItems[0].price}`);
        }
      });
    } else {
      console.log('[FinancialReportController] No completed orders found to inspect.');
    }

    res.json({
      summary: reportSummary,
      details: completedOrders 
    });
    console.log('[FinancialReportController] === getFinancialReport completed successfully ===');

  } catch (error) {
    console.error('ERROR: Gagal mengambil laporan keuangan:', error);
    console.error('Error Stack:', error.stack);
    res.status(500).json({ message: 'Gagal mengambil laporan keuangan', error: error.message });
  }
});

const exportFinancialReportToExcel = asyncHandler(async (req, res) => {
  console.log('[FinancialReportController] === Entering exportFinancialReportToExcel function ===');
  try {
    console.log('[FinancialReportController] Excel Step 1: Attempting to fetch completed orders...');
  
    const completedOrders = await Order.find({ orderStatus: 'Completed' })
    
      .sort({ createdAt: 1 });

    console.log(`[FinancialReportController] Excel Step 2: Successfully fetched ${completedOrders.length} completed orders.`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Keuangan');

    worksheet.columns = [
      { header: 'ID Pesanan', key: '_id', width: 30 },
      { header: 'Tanggal Pesanan', key: 'createdAt', width: 20 },
      { header: 'ID Pembeli', key: 'userId', width: 25 }, // Changed to userId
      { header: 'Metode Pembayaran', key: 'paymentMethod', width: 20 },
      { header: 'Total Harga', key: 'totalPrice', width: 15 },
      { header: 'Status Pesanan', key: 'orderStatus', width: 15 },
      { header: 'Item Pesanan', key: 'orderItemsSummary', width: 50 },
    ];

   
    console.log('[FinancialReportController] Excel Step 3: Adding rows to worksheet...');
    completedOrders.forEach((order, index) => {
  
      const userId = order.user ? order.user.toString() : 'N/A'; 
      const orderItemsSummary = order.orderItems.map(item => `${item.name || 'N/A'} (${item.quantity || 0}x)`).join(', ');

      worksheet.addRow({
        _id: order._id.toString(),
        createdAt: formatDate(order.createdAt),
        userId: userId,
        paymentMethod: order.paymentMethod || 'N/A',
        totalPrice: order.totalPrice || 0,
        orderStatus: order.orderStatus || 'N/A',
        orderItemsSummary: orderItemsSummary,
      });
      console.log(`[FinancialReportController] Excel Step 3.1: Added row for order ${index + 1}.`);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'Laporan_Keuangan_Completed.xlsx');

    console.log('[FinancialReportController] Excel Step 4: Writing workbook to response...');
    await workbook.xlsx.write(res);
    res.end();
    console.log('[FinancialReportController] === Excel export completed successfully ===');

  } catch (error) {
    console.error('ERROR: Gagal mengekspor laporan Excel:', error);
    console.error('Error Stack:', error.stack);
    res.status(500).json({ message: 'Gagal mengekspor laporan Excel', error: error.message });
  }
});

const exportFinancialReportToPdf = asyncHandler(async (req, res) => {
  console.log('[FinancialReportController] === Entering exportFinancialReportToPdf function ===');
  try {
    console.log('[FinancialReportController] PDF Step 1: Attempting to fetch completed orders...');
 
    const completedOrders = await Order.find({ orderStatus: 'Completed' })
  
      .sort({ createdAt: 1 });

    console.log(`[FinancialReportController] PDF Step 2: Successfully fetched ${completedOrders.length} completed orders.`);

    const doc = new PDFDocument();
    let filename = 'Laporan_Keuangan_Completed.pdf';
    filename = encodeURIComponent(filename);

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Laporan Keuangan Pesanan Selesai', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tanggal Laporan: ${formatDate(new Date(), false)}`); 
    doc.moveDown();

    console.log('[FinancialReportController] PDF Step 3: Adding order details to PDF...');
    completedOrders.forEach((order, index) => {
      console.log(`[FinancialReportController] PDF Step 3.1: Processing order ${index + 1} for PDF.`);
    
      const userName = order.user ? `ID: ${order.user.toString()}` : 'N/A'; 
      const userEmail = order.user ? `(Email tidak tersedia tanpa populate)` : ''; 

      doc.fontSize(14).text(`Pesanan #${index + 1} - ID: ${order._id.toString()}`, { underline: true });
      doc.fontSize(10).text(`Tanggal: ${formatDate(order.createdAt)}`);
      doc.text(`Pembeli: ${userName} ${userEmail}`);
      doc.text(`Metode Pembayaran: ${order.paymentMethod || 'N/A'}`);
      doc.text(`Status: ${order.orderStatus || 'N/A'}`);
      doc.text(`Total Harga: ${formatCurrency(order.totalPrice)}`);
      doc.text('Item Pesanan:');
      order.orderItems.forEach(item => {
        doc.text(`  - ${item.name || 'N/A'} (${item.quantity || 0}x) @ ${formatCurrency(item.price || 0)}`);
      });
      doc.moveDown();
    });

    console.log('[FinancialReportController] PDF Step 4: Ending PDF document...');
    doc.end();
    console.log('[FinancialReportController] === PDF export completed successfully ===');

  } catch (error) {
    console.error('ERROR: Gagal mengekspor laporan PDF:', error);
    console.error('Error Stack:', error.stack);
    res.status(500).json({ message: 'Gagal mengekspor laporan PDF', error: error.message });
  }
});

export {
  getFinancialReport,
  exportFinancialReportToExcel,
  exportFinancialReportToPdf,
};
