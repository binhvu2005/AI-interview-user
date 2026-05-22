import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block', 'hr'],
      ['link', 'image', 'video', 'table'],
      ['clean'],
      ['undo', 'redo'],
    ],
    handlers: {
      'undo': function(this: any) { this.quill.history.undo(); },
      'redo': function(this: any) { this.quill.history.redo(); },
    }
  },
  history: {
    delay: 1000,
    maxStack: 100,
    userOnly: true
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'indent',
  'link', 'image', 'video',
  'align', 'code-block'
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, readOnly = false }) => {
  return (
    <div className={`rich-text-editor-container ${readOnly ? 'read-only opacity-70 bg-surface-container-high/50 cursor-not-allowed' : ''}`}>
      <ReactQuill 
        theme={readOnly ? 'bubble' : 'snow'}
        value={value}
        onChange={onChange}
        modules={readOnly ? { toolbar: false } : modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
};

export default RichTextEditor;
