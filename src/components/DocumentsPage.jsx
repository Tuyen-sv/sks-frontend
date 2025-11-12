// import { useState } from "react";
// import { Container, Row, Col } from "react-bootstrap";
// import DocumentsList from "./DocumentsList";
// import FoldersList from "./FoldersList";

// const DocumentsPage = () => {
//   const [selectedFolderId, setSelectedFolderId] = useState(null);

//   const handleFolderSelect = (folderId) => {
//     console.log("Folder selected in parent:", folderId);
//     setSelectedFolderId(folderId);
//   };

//   return (
//     <Container fluid className="mt-4">
//       <Row>
//         <Col md={4}>
//           <FoldersList onFolderSelect={handleFolderSelect} />
//         </Col>
//         <Col md={8}>
//           <DocumentsList 
//             currentFolderId={selectedFolderId}
//             onFolderSelect={handleFolderSelect}
//           />
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default DocumentsPage;