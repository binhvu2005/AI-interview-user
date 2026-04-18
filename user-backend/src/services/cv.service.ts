import * as pdfParse from 'pdf-parse';
import { User } from '../models/user.model';

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
    if (file.mimetype === 'application/pdf') {
      try {
        // pdf-parse v1 exports a function directly: module.exports = function(dataBuffer, options)
        const parseFn = (pdfParse as any).default || pdfParse;
        const data = await parseFn(file.buffer);
        content = data.text;
        console.log('PDF parsed successfully, text length:', content.length);
      } catch (pdfErr: any) {
        console.error('PDF Parse Error:', pdfErr.message);
        throw new Error('Could not parse PDF file: ' + pdfErr.message);
      }
    } else {
      content = file.buffer.toString('utf-8');
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
