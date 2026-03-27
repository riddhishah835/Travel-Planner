import React, { useState, useRef } from 'react';
import { storage, db } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Paperclip, FileText, Trash2, Download, UploadCloud, Loader2 } from 'lucide-react';

const DocumentsSection = ({ trip, tripId, onUpdateTrip }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const documents = trip.documents || [];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a unique filename
    const uniqueFilename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `users/${currentUser.uid}/trips/${tripId}/${uniqueFilename}`);
    
    setIsUploading(true);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload failed", error);
        alert("Failed to upload document. Please ensure Firebase Storage rules allow writes.");
        setIsUploading(false);
      }, 
      async () => {
        // Successful Upload
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        const newDocConfig = {
          name: file.name,
          storagePath: `users/${currentUser.uid}/trips/${tripId}/${uniqueFilename}`,
          url: downloadURL,
          uploadedAt: new Date().toISOString()
        };

        try {
          const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
          await updateDoc(tripRef, {
            documents: arrayUnion(newDocConfig)
          });
          
          onUpdateTrip({
            ...trip,
            documents: [...documents, newDocConfig]
          });
          
        } catch (dbError) {
          console.error("Failed to update trip documents array", dbError);
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    );
  };

  const handleDeleteDocument = async (docObj) => {
    if (!window.confirm(`Are you sure you want to delete ${docObj.name}?`)) return;
    
    try {
      // Remove from Storage
      const storageRef = ref(storage, docObj.storagePath);
      await deleteObject(storageRef);
      
      // Remove from Firestore
      const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
      await updateDoc(tripRef, {
        documents: arrayRemove(docObj)
      });
      
      onUpdateTrip({
        ...trip,
        documents: documents.filter(d => d.storagePath !== docObj.storagePath)
      });
      
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 flex flex-col md:flex-row items-center gap-8 justify-between">
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Paperclip className="w-6 h-6 text-teal-600" /> Digital Wallet
          </h3>
          <p className="text-gray-500 font-medium">Securely store e-tickets, hotel bookings, passports, and visas.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full md:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-teal-500/20 flex flex-col items-center justify-center min-w-[200px]"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2 w-full">
                <Loader2 className="w-5 h-5 animate-spin" /> 
                <span className="w-12 text-center text-sm">{Math.round(uploadProgress)}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <UploadCloud className="w-5 h-5" /> Select File
              </div>
            )}
            
            {/* Progress bar overlay indicator */}
            <div className="w-full bg-teal-800/50 rounded-full h-1 mt-3 overflow-hidden">
               <div className="bg-teal-300 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </button>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-1">No documents uploaded yet</h4>
            <p className="text-gray-500">Keep important travel files handy by storing them here.</p>
          </div>
        ) : (
          documents.map((docObj, idx) => (
            <div key={idx} className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all flex flex-col gap-4">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate" title={docObj.name}>{docObj.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">Added on {new Date(docObj.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
                <a 
                  href={docObj.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> View
                </a>
                <button 
                  onClick={() => handleDeleteDocument(docObj)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default DocumentsSection;
