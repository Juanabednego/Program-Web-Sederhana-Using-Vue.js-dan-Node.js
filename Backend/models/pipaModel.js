import mongoose from 'mongoose';

const { Schema } = mongoose;

const pipeSchema = new Schema({
    pipeName: {
        type: String,
        required: [true, "Nama pipa harus diisi"],
    },
    pipeType: {
        type: String,
        required: [true, "Jenis pipa harus diisi"],
        enum: ['PVC', 'HDPE', 'PPR', 'Besi', 'Lainnya'], // bisa ditambahkan sesuai jenis pipa lainnya
    },
    diameter: {
        type: Number,
        required: [true, "Diameter pipa harus diisi"],
        min: [1, "Diameter minimal 1mm"],
        max: [1000, "Diameter maksimal 1000mm"], // bisa disesuaikan
    },
    length: {
        type: Number,
        required: [true, "Panjang pipa harus diisi"],
        min: [1, "Panjang minimal 1 meter"],
    },
    wallThickness: {
        type: Number,
        required: [true, "Ketebalan dinding pipa harus diisi"],
        min: [1, "Ketebalan minimal 1mm"],
    },
    pipeClass: {
        type: String,
        required: [true, "Kelas pipa harus diisi"],
        enum: ['Class A', 'Class B', 'Class C'], // kelas pipa sesuai dengan standar
    },
    material: {
        type: String,
        required: [true, "Material pipa harus diisi"],
    },
    color: {
        type: String,
        required: [true, "Warna pipa harus diisi"],
    },
    pricePerMeter: {
        type: Number,
        required: [true, "Harga per meter pipa harus diisi"],
        min: [0, "Harga tidak boleh negatif"],
    },
    stock: {
        type: Number,
        required: [true, "Jumlah stok harus diisi"],
        min: [0, "Stok tidak boleh kurang dari 0"],
    },
    productionDate: {
        type: Date,
        required: [true, "Tanggal produksi harus diisi"],
    },
    status: {
        type: String,
        enum: ['Aktif', 'Tidak Aktif', 'Habis Stok'],
        default: 'Aktif',
    },
    description: {
        type: String,
        default: "",
    },
    imageUrl: {
        type: String,
        default: "", // URL gambar dari Cloudinary
    }
});

// Membuat model Pipa berdasarkan schema
const Pipe = mongoose.model("Pipe", pipeSchema);

export default Pipe;
