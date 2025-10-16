// Code Editor (placeholder). Replace with Monaco or CodeMirror later.
import React from 'react';

const CodeEditor = ({ value, onChange, language = 'javascript', readOnly = false, rows = 12 }) => {
  return (
    <textarea
      className="input-field font-mono text-sm"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      readOnly={readOnly}
      rows={rows}
      placeholder={`Write ${language} code here...`}
      spellCheck={false}
    />
  );
};

export default CodeEditor;
