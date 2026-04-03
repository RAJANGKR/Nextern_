/* ================================================================
   models/User.js — User schema

   TEACH: A Mongoose Schema defines the shape of documents
   stored in MongoDB. Think of it like a table definition in SQL.

   Each field has:
   - type: what kind of data (String, Number, Boolean, etc.)
   - required: is it mandatory?
   - unique: no two users can have the same value
   - default: what value if not provided

   We also add a pre-save hook to hash the password before
   saving to the database. NEVER store plain text passwords.
================================================================ */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({

    // ── BASIC INFO ──
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        minlength: 8,
        // select: false means password won't be returned in queries by default
        // We only select it when we explicitly need to (like login)
        select: false,
    },

    // ── ACADEMIC INFO ──
    college: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: String },
    cgpa: { type: Number, min: 0, max: 10 },
    graduationYear: { type: Number },

    // ── CAREER INFO ──
    skills: [{ type: String }],
    targetCompanies: [{ type: String }],
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },


    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },

    // ── OAUTH ──
    // googleId is set when user signs in with Google
    // If googleId exists, password is not required
    googleId: { type: String },
    avatar: { type: String },   // profile picture URL (from Google)
    isAdmin: { type: Boolean, default: false },

    // ── TIMESTAMPS ──
    // createdAt and updatedAt are added automatically by { timestamps: true }

}, { timestamps: true });


/* ----------------------------------------------------------------
   PRE-SAVE HOOK — hash password before saving

   TEACH: Mongoose middleware runs before/after certain operations.
   'pre save' runs just before .save() is called.

   bcrypt.genSalt(10) — generates a salt with 10 rounds.
   More rounds = more secure but slower. 10 is the industry standard.

   bcrypt.hash(password, salt) — hashes the password with the salt.
   The resulting hash looks like: $2b$10$... (60 chars)
---------------------------------------------------------------- */
UserSchema.pre('save', async function (next) {
    // Only hash if password was changed (not on every save)
    if (!this.isModified('password') || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


/* ----------------------------------------------------------------
   INSTANCE METHOD — comparePassword
   Called during login to check if entered password matches hash.

   TEACH: We add custom methods to the schema.
   this.password = the hashed password from the database
   candidatePassword = the plain text password the user typed
---------------------------------------------------------------- */
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
