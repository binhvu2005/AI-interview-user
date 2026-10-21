import * as pdfParse from 'pdf-parse';
import { User } from '../models/user.model';

// Shared by the vault upload and the one-off extraction used before a CV analysis: reading a PDF as
// text in the browser yields binary bytes, never the CV's words.
export const extractCVText = async (file: Express.Multer.File): Promise<string> => {
  if (file.mimetype !== 'application/pdf') return file.buffer.toString('utf-8');
  // pdf-parse v1 exports a function directly: module.exports = function(dataBuffer, options)
  const parseFn = (pdfParse as any).default || pdfParse;
  const data = await parseFn(file.buffer);
  return data.text || '';
};

export const processAndSaveCV = async (userId: string, file: Express.Multer.File | undefined, customName?: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let content = '';
  let pdfData = '';
  let fileName = customName || 'Untitled CV';

  if (file) {
    console.log('Processing file:', file.originalname, 'Mime:', file.mimetype);
    fileName = file.originalname;
    pdfData = file.buffer.toString('base64');
    try {
      content = await extractCVText(file);
      console.log('CV parsed successfully, text length:', content.length);
    } catch (pdfErr: any) {
      console.error('PDF Parse Error:', pdfErr.message);
      throw new Error('Could not parse PDF file: ' + pdfErr.message);
    }
  }

  const newCV = {
    id: Date.now().toString(),
    name: fileName,
    content: content,
    pdfData: pdfData,
    uploadDate: new Date()
  };

  user.savedCVs.push(newCV);
  await user.save();
  return user.savedCVs;
};

export const deleteUserCV = async (userId: string, cvId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const filtered = user.savedCVs.filter(cv => cv.id !== cvId);
  (user.savedCVs as any) = filtered;
  
  await user.save();
  return user.savedCVs;
};
