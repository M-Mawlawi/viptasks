import React, { useState } from "react";
import AvatarEditor from "react-avatar-editor";

const ImageEditorOverlay = ({ image, onClose, onSave }) => {
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1);

  const handleSave = () => {
    if (editor) {
      // Get the canvas with the edited image
      const canvas = editor.getImageScaledToCanvas();
      
      // Convert the canvas to a data URL
      const croppedImage = canvas.toDataURL();

      // Call the onSave function with the cropped image
      onSave(croppedImage);
    }
  };

  return (
    <div className="fixed w-full h-full top-0 left-0 z-10">
  <div className="bg-black bg-opacity-50 w-full h-full flex items-center">
    <div className="flex flex-col items-center w-1/2 mx-auto my-auto bg-slate-200 shadow-md rounded-lg px-8 py-20 gap-2">
      <AvatarEditor
        ref={(editor) => setEditor(editor)}
        image={image}
        width={200}
        height={200}
        scale={scale}
      />
      <input
        type="range"
        min="1"
        max="2"
        step="0.01"
        value={scale}
        onChange={(e) => setScale(parseFloat(e.target.value))}
      />
      <div className="flex gap-2">
        <button className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleSave}>Save</button>
        <button className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
</div>

  );
};

export default ImageEditorOverlay;
