import { Route, Routes } from "react-router-dom";
import App from "./App";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import DocumentsList from "./components/documents/DocumentsList";
import DocumentViewer from "./components/DocumentViewer"; 
import UploadDocumentsFolder from "./components/uploadData/UploadDocumentsFolder"; 
import FoldersList from "./components/folders/FoldersList";

const Layout = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="register" element={<Register />} />
           <Route path="login" element={<Login />} />
          {/* <Route path="" element={<DocumentsList />} /> */}

          <Route path="" element={
            <div>
              <UploadDocumentsFolder />
              <FoldersList />
              <DocumentsList />
            </div>
          } />
          <Route path="/documents/:documentId/view" element={<DocumentViewer />} />
        </Route>
      </Routes>
    </>
  );
};

export default Layout;