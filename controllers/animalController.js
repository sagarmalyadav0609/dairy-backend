import Animal from '../models/Animal.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';

// @desc    Get all animals (with search, filter, pagination)
// @route   GET /api/animals
// @access  Private
export const getAnimals = async (req, res) => {
  try {
    const { search, type, breed, gender, healthStatus, pregnancyStatus, lactationStatus } = req.query;

    let query = {};

    // Global Search
    if (search) {
      query.$or = [
        { animalId: { $regex: search, $options: 'i' } },
        { tagNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { rfidNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (type) query.type = type;
    if (breed) query.breed = breed;
    if (gender) query.gender = gender;
    if (healthStatus) query.healthStatus = healthStatus;
    if (pregnancyStatus) query.pregnancyStatus = pregnancyStatus;
    if (lactationStatus) query.lactationStatus = lactationStatus;

    const animals = await Animal.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: animals.length, data: animals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single animal by ID
// @route   GET /api/animals/:id
// @access  Private
export const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }
    res.json({ success: true, data: animal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get animal by serial ID (for QR code scan / global search)
// @route   GET /api/animals/serial/:animalId
// @access  Private
export const getAnimalBySerialId = async (req, res) => {
  try {
    const animal = await Animal.findOne({ animalId: req.params.animalId });
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal code not found' });
    }
    res.json({ success: true, data: animal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new animal record
// @route   POST /api/animals
// @access  Private
export const createAnimal = async (req, res) => {
  try {
    const animalData = { ...req.body };

    // Handle single uploaded image
    if (req.file) {
      animalData.image = `/uploads/${req.file.filename}`;
    }

    // Check for duplicate Tag Number
    const existing = await Animal.findOne({ tagNumber: animalData.tagNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tag Number already exists' });
    }

    const animal = await Animal.create(animalData);
    res.status(201).json({ success: true, data: animal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update animal record
// @route   PUT /api/animals/:id
// @access  Private
export const updateAnimal = async (req, res) => {
  try {
    const animalData = { ...req.body };

    if (req.file) {
      animalData.image = `/uploads/${req.file.filename}`;
    }

    const animal = await Animal.findByIdAndUpdate(req.params.id, animalData, {
      new: true,
      runValidators: true,
    });

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    res.json({ success: true, data: animal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete animal record
// @route   DELETE /api/animals/:id
// @access  Private
export const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }
    res.json({ success: true, message: 'Animal removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Animals list to Excel sheet
// @route   GET /api/animals/export/excel
// @access  Private
export const exportAnimalsExcel = async (req, res) => {
  try {
    const animals = await Animal.find({}).lean();
    
    const formatted = animals.map((a) => ({
      'Animal ID': a.animalId,
      'Tag Number': a.tagNumber,
      'RFID Number': a.rfidNumber || 'N/A',
      'Name': a.name || 'N/A',
      'Type': a.type,
      'Breed': a.breed || 'N/A',
      'Gender': a.gender,
      'Weight (kg)': a.weight || 'N/A',
      'Pregnancy Status': a.pregnancyStatus,
      'Lactation Status': a.lactationStatus,
      'Health Status': a.healthStatus,
      'Vaccination': a.vaccinationStatus,
      'Value ($)': a.currentValue || 0,
      'D.O.B.': a.dateOfBirth ? new Date(a.dateOfBirth).toLocaleDateString() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Animals');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=animals_list.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Animal details card with QR code as PDF
// @route   GET /api/animals/:id/pdf
// @access  Private
export const exportAnimalCardPDF = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    // Generate QR Code containing animal serial number
    const qrData = JSON.stringify({ animalId: animal.animalId, tag: animal.tagNumber });
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 150 });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Stream PDF directly to client response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Animal_Card_${animal.animalId}.pdf`);
    doc.pipe(res);

    // PDF Layout construction
    doc.fillColor('#1b4332').rect(0, 0, 595.28, 120).fill(); // Title Background bar

    doc.fillColor('#ffffff').fontSize(24).text('ROYAL DAIRY FARM', 50, 35, { align: 'center' });
    doc.fontSize(14).text('Official Animal Identification Card', 50, 70, { align: 'center' });

    doc.fillColor('#333333').fontSize(12);

    // Left Column details
    let y = 160;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1b4332').text('Animal Identification details', 50, y);
    doc.moveTo(50, y + 20).lineTo(320, y + 20).strokeColor('#c2c2c2').stroke();

    y += 35;
    const details = [
      ['Animal ID:', animal.animalId],
      ['Tag Number:', animal.tagNumber],
      ['RFID Number:', animal.rfidNumber || 'Not Registered'],
      ['Name:', animal.name || 'Unnamed'],
      ['Animal Type:', animal.type],
      ['Breed:', animal.breed || 'Not Specified'],
      ['Gender:', animal.gender],
      ['Weight:', animal.weight ? `${animal.weight} kg` : 'N/A'],
      ['Health Status:', animal.healthStatus],
      ['Pregnancy:', animal.pregnancyStatus],
      ['Lactation:', animal.lactationStatus],
    ];

    details.forEach(([label, val]) => {
      doc.font('Helvetica-Bold').fillColor('#333333').text(label, 50, y);
      doc.font('Helvetica').text(String(val), 180, y);
      y += 22;
    });

    // Right Column QR Code
    doc.image(qrBuffer, 380, 160, { width: 160, height: 160 });
    doc.rect(370, 150, 180, 180).strokeColor('#1b4332').lineWidth(2).stroke();
    doc.fontSize(10).fillColor('#666666').text('Scan to Open Profile', 380, 340, { width: 160, align: 'center' });

    // Breeding parent details
    y = 440;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1b4332').text('Parentage & Value', 50, y);
    doc.moveTo(50, y + 20).lineTo(540, y + 20).strokeColor('#c2c2c2').stroke();

    y += 35;
    const secondaryDetails = [
      ['Sire (Father Name):', animal.fatherName || 'Unknown'],
      ['Dam (Mother Name):', animal.motherName || 'Unknown'],
      ['Current Value:', animal.currentValue ? `$${animal.currentValue}` : 'Not Valued'],
      ['Purchase Price:', animal.purchasePrice ? `$${animal.purchasePrice}` : 'N/A'],
    ];

    secondaryDetails.forEach(([label, val]) => {
      doc.font('Helvetica-Bold').fillColor('#333333').text(label, 50, y);
      doc.font('Helvetica').text(String(val), 200, y);
      y += 22;
    });

    // Footer info
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#999999').text('Document generated automatically. Verification stamp valid.', 50, 750, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
