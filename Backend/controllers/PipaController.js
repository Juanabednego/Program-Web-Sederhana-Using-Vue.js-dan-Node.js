import Pipe from "../models/pipaModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getAllPipa = asyncHandler(async (req, res) => {
    const pipes = await Pipe.find();
    res.status(200).json(pipes);
});
 
export const getPipaById = asyncHandler(async (req, res) => {
    const pipe = await Pipe.findById(req.params.id);
    if (!pipe) {
        res.status(404);
        throw new Error("Pipa tidak ditemukan");
    }
    res.status(200).json(pipe);
});

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
        imageUrl 
    } = req.body;

    const existingPipe = await Pipe.findOne({ pipeName });
    if (existingPipe) {
        res.status(400);
        throw new Error("Pipa dengan nama ini sudah ada");
    }

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
        imageUrl 
    } = req.body;

    if (pipeName && pipeName !== pipe.pipeName) {
        const existingPipe = await Pipe.findOne({ pipeName });
        if (existingPipe) {
            res.status(400);
            throw new Error("Pipa dengan nama ini sudah ada");
        }
    }

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

export const deletePipa = asyncHandler(async (req, res) => {
    const pipe = await Pipe.findById(req.params.id);
    if (!pipe) {
        res.status(404);
        throw new Error("Pipa tidak ditemukan");
    }

    await Pipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pipa berhasil dihapus" });
});

