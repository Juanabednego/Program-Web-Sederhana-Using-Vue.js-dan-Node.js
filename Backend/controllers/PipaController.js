import Pipe from "../models/pipaModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Get All Pipa
export const getAllPipa = asyncHandler(async (req, res) => {
    const pipes = await Pipe.find();
    res.status(200).json(pipes);
});
 
// Get Pipa by ID
export const getPipaById = asyncHandler(async (req, res) => {
    const pipe = await Pipe.findById(req.params.id);
    if (!pipe) {
        res.status(404);
        throw new Error("Pipa tidak ditemukan");
    }
    res.status(200).json(pipe);
});

// Create Pipa
export const createPipa = asyncHandler(async (req, res) => {
    const { 
        pipeName, 
        pipeType, 
        diameter, 
        length, 
        wallThickness, 
        pipeClass, 
        material, 
        color, 
        pricePerMeter, 
        stock, 
        productionDate, 
        description,
        imageUrl // Tambahkan imageUrl dari request body
    } = req.body;

    // Validasi apakah pipa sudah ada dengan nama yang sama
    const existingPipe = await Pipe.findOne({ pipeName });
    if (existingPipe) {
        res.status(400);
        throw new Error("Pipa dengan nama ini sudah ada");
    }

    // Buat objek pipa baru
    const pipeData = {
        pipeName,
        pipeType,
        diameter,
        length,
        wallThickness,
        pipeClass,
        material,
        color,
        pricePerMeter,
        stock,
        productionDate,
        description
    };

    // Tambahkan imageUrl jika ada
    if (imageUrl) {
        pipeData.imageUrl = imageUrl;
    }

    const newPipe = new Pipe(pipeData);

    try {
        const createdPipe = await newPipe.save();
        res.status(201).json({
            message: "Pipa berhasil dibuat",
            data: createdPipe
        });
    } catch (error) {
        res.status(400);
        throw new Error("Gagal membuat pipa: " + error.message);
    }
});
    
// Update Pipa
export const updatePipa = asyncHandler(async (req, res) => {
    const pipe = await Pipe.findById(req.params.id);
    if (!pipe) {
        res.status(404);
        throw new Error("Pipa tidak ditemukan");
    }

    const { 
        pipeName, 
        pipeType, 
        diameter, 
        length, 
        wallThickness, 
        pipeClass, 
        material, 
        color, 
        pricePerMeter, 
        stock, 
        productionDate, 
        description, 
        status,
        imageUrl // Tambahkan imageUrl untuk update
    } = req.body;

    // Validasi nama pipa jika diubah
    if (pipeName && pipeName !== pipe.pipeName) {
        const existingPipe = await Pipe.findOne({ pipeName });
        if (existingPipe) {
            res.status(400);
            throw new Error("Pipa dengan nama ini sudah ada");
        }
    }

    // Update fields
    pipe.pipeName = pipeName || pipe.pipeName;
    pipe.pipeType = pipeType || pipe.pipeType;
    pipe.diameter = diameter || pipe.diameter;
    pipe.length = length || pipe.length;
    pipe.wallThickness = wallThickness || pipe.wallThickness;
    pipe.pipeClass = pipeClass || pipe.pipeClass;
    pipe.material = material || pipe.material;
    pipe.color = color || pipe.color;
    pipe.pricePerMeter = pricePerMeter || pipe.pricePerMeter;
    pipe.stock = stock || pipe.stock;
    pipe.productionDate = productionDate || pipe.productionDate;
    pipe.description = description || pipe.description;
    pipe.status = status || pipe.status;
    
    // Update imageUrl jika ada
    if (imageUrl !== undefined) {
        pipe.imageUrl = imageUrl;
    } 
 
    try {
        const updatedPipe = await pipe.save();
        res.status(200).json({
            message: "Pipa berhasil diperbarui",
            data: updatedPipe
        });
    } catch (error) {
        res.status(400);
        throw new Error("Gagal memperbarui pipa: " + error.message);
    }
}); 

// Delete Pipa
export const deletePipa = asyncHandler(async (req, res) => {
    const pipe = await Pipe.findById(req.params.id);
    if (!pipe) {
        res.status(404);
        throw new Error("Pipa tidak ditemukan");
    }

    await Pipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pipa berhasil dihapus" });
});

