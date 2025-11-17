import React, { useRef } from 'react';
import Papa from 'papaparse';

function FileUpload({ title, onDataLoaded, fileName }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onDataLoaded(results.data, file.name);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the file format.');
        }
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-box">
      <h3>{title}</h3>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      <button className="upload-button" onClick={handleButtonClick}>
        Choose File
      </button>
      {fileName && (
        <div className="file-info">
          Loaded: {fileName}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
