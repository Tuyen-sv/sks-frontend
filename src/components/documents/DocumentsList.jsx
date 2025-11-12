import { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Table,
  Alert,
  Spinner,
  Button,
  Row,
  Col,
  Badge,
  Modal,
  Form,
  Pagination,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  moveDocumentToFolder,
  getDocumentsByFolder,
} from "../../service/documentsAPI";
import { getAllFolders } from "../../service/foldersAPI";
import { isAuthenticated } from "../../utils/auth";

const DocumentsList = ({ currentFolderId, onFolderSelect }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState("");
  const [documentToMove, setDocumentToMove] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [allFolders, setAllFolders] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchAllFolders = async () => {
    try {
      const response = await getAllFolders();
      if (response && response.folders) {
        setAllFolders(response.folders);
      }
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  const fetchDocuments = async (page = currentPage, limit = itemsPerPage, folderId = currentFolderId) => {
    try {
      setLoading(true);
      setError("");
      if (!isAuthenticated()) {
        setError("Please login to view documents");
        setLoading(false);
        return;
      }

      let response;
      console.log("Fetching documents for folder:", folderId);
      
      if (folderId) {
        response = await getDocumentsByFolder(folderId, page, limit);
      } else {
        response = await getDocuments(page, limit);
      }

      console.log("Documents data:", response);
      
      if (response && typeof response === "object") {
        if (Array.isArray(response.documents)) {
          setDocuments(response.documents);
          setTotal(response.total || response.documents.length);
          setTotalPages(
            response.totalPages ||
              Math.ceil((response.total || response.documents.length) / limit)
          );
        } else if (Array.isArray(response.data)) {
          setDocuments(response.data);
          setTotal(response.total || response.data.length);
          setTotalPages(
            response.totalPages ||
              Math.ceil((response.total || response.data.length) / limit)
          );
        } else if (Array.isArray(response)) {
          setDocuments(response);
          setTotal(response.length);
          setTotalPages(Math.ceil(response.length / limit));
        } else if (response.documents === null || response.documents === undefined) {
          setDocuments([]);
          setTotal(0);
          setTotalPages(0);
        } else {
          console.log("Unexpected response structure:", response);
          setDocuments([]);
          setTotal(0);
          setTotalPages(1);
        }
      } else {
        setDocuments([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Session expired. Please login again.");
      } else if (err.message.includes("404") || err.message.includes("not found")) {
        setDocuments([]);
        setTotal(0);
        setTotalPages(0);
        setError("");
      } else {
        setError(err.message || "Failed to load documents");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current folder ID changed:", currentFolderId);
    setCurrentPage(1);
    fetchDocuments(1, itemsPerPage, currentFolderId);
    
    if (!currentFolderId) {
      fetchAllFolders();
    }
  }, [currentFolderId, itemsPerPage]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchDocuments(currentPage, itemsPerPage, currentFolderId);
    }
  }, [currentPage]);

  const handleRefresh = () => {
    fetchDocuments(currentPage, itemsPerPage, currentFolderId);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError("File size must be less than 50MB");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }
    try {
      setUploading(true);
      setUploadError("");
      const result = await uploadDocument(selectedFile);
      console.log("Upload successful:", result);
      setShowUploadModal(false);
      setSelectedFile(null);
      setError("");
      alert(result.message || "File uploaded successfully!");
      setCurrentPage(1);
      await fetchDocuments(1, itemsPerPage, currentFolderId);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (document) => {
    if (!document) return;
    setDocumentToDelete(document);
    setShowDeleteModal(true);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    try {
      setDeleting(true);
      setDeleteError("");
      const documentId = documentToDelete.id || documentToDelete.documentId;
      if (!documentId) {
        throw new Error("Invalid document ID");
      }
      const result = await deleteDocument(documentId);
      console.log("Delete successful:", result);
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      alert(result.message || "Document deleted successfully!");
      if (documents.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        await fetchDocuments(newPage, itemsPerPage, currentFolderId);
      } else {
        await fetchDocuments(currentPage, itemsPerPage, currentFolderId);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveClick = (document) => {
    if (!document) return;
    setDocumentToMove(document);
    setSelectedFolderId("");
    setMoveError("");
    setShowMoveModal(true);
    fetchAllFolders();
  };

  const handleMoveConfirm = async () => {
    if (!documentToMove || !selectedFolderId) {
      setMoveError("Please select a folder");
      return;
    }

    try {
      setMoving(true);
      setMoveError("");
      const documentId = documentToMove.id || documentToMove.documentId;
      if (!documentId) {
        throw new Error("Invalid document ID");
      }

      const result = await moveDocumentToFolder(documentId, selectedFolderId);
      console.log("Move successful:", result);
      setShowMoveModal(false);
      setDocumentToMove(null);
      setSelectedFolderId("");
      alert(result.message || "Document moved successfully!");
      
      await fetchDocuments(currentPage, itemsPerPage, currentFolderId);
    } catch (err) {
      console.error("Move error:", err);
      setMoveError(err.message || "Failed to move document");
    } finally {
      setMoving(false);
    }
  };

  const handleView = (document) => {
    if (!document) {
      alert("Invalid document");
      return;
    }
    try {
      const documentId = document.id || document.documentId;
      if (!documentId) {
        alert("Document ID not found");
        return;
      }
      const filename = document.filename || document.title || document.name || "document";
      const fileExtension = getFileExtension(document);
      
      localStorage.setItem(
        "currentDocument",
        JSON.stringify({
          ...document,
          id: documentId,
          filename: filename,
          fileExtension: fileExtension,
        })
      );
      
      navigate(`/documents/${documentId}/view`);
    } catch (err) {
      console.error("View error:", err);
      alert(`Cannot view document: ${err.message}`);
    }
  };

  const handleDownload = async (documentItem) => {
    if (!documentItem) return;
    try {
      const documentId = documentItem.id || documentItem.documentId;
      const filename = documentItem.title || documentItem.filename || documentItem.name || "document";
      
      if (!documentId) {
        alert("Document ID not found");
        return;
      }
      
      setDownloading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch(
        `http://103.245.237.127/documents/${documentId}/file`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      
      const contentDisposition = response.headers.get("content-disposition");
      let downloadFilename = filename;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      if (!downloadFilename.includes(".")) {
        const fileExtension = getFileExtension(documentItem);
        downloadFilename = `${downloadFilename}.${fileExtension}`;
      }
      
      downloadLink.setAttribute("download", downloadFilename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(url);
      
      console.log("Download successful:", downloadFilename);
    } catch (err) {
      console.error("Download error:", err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDocumentNameClick = (document) => {
    handleView(document);
  };

  const handleShowAllDocuments = () => {
    if (onFolderSelect) {
      onFolderSelect(null);
    }
  };

  const renderFolderOptions = (folders, level = 0) => {
    let options = [];
    
    folders.forEach(folder => {
      const indent = '  '.repeat(level);
      options.push(
        <option key={folder.id} value={folder.id}>
          {indent}📁 {folder.name}
        </option>
      );
      
      if (folder.children && folder.children.length > 0) {
        options = options.concat(renderFolderOptions(folder.children, level + 1));
      }
    });
    
    return options;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getFileExtension = (document) => {
    if (!document) return "unknown";
    const filename = document.filename || document.title || document.name || "";
    if (!filename) return "unknown";
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "unknown";
  };

  const getFileIcon = (fileExtension) => {
    const extension = fileExtension.toLowerCase();
    const iconMap = {
      pdf: "bi-file-earmark-pdf",
      doc: "bi-file-earmark-word",
      docx: "bi-file-earmark-word",
      txt: "bi-file-earmark-text",
      jpg: "bi-file-earmark-image",
      jpeg: "bi-file-earmark-image",
      png: "bi-file-earmark-image",
      gif: "bi-file-earmark-image",
      bmp: "bi-file-earmark-image",
      xlsx: "bi-file-earmark-excel",
      xls: "bi-file-earmark-excel",
      pptx: "bi-file-earmark-ppt",
      ppt: "bi-file-earmark-ppt",
      zip: "bi-file-earmark-zip",
      rar: "bi-file-earmark-zip",
    };
    return iconMap[extension] || "bi-file-earmark";
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      processed: "success",
      processing: "warning",
      pending: "secondary",
      failed: "danger",
    };
    return statusMap[status?.toLowerCase()] || "secondary";
  };

  const renderFolderIndicator = () => {
    if (currentFolderId) {
      return (
        <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light border-bottom">
          <div className="d-flex align-items-center">
            <Badge bg="info" className="me-2">
              <i className="bi bi-folder me-1"></i>
              Folder View
            </Badge>
            <small className="text-muted">
              Showing documents from selected folder
            </small>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleShowAllDocuments}
          >
            <i className="bi bi-eye me-1"></i>
            Show All Documents
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    return items;
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2 text-muted">Loading documents...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <Card.Header className="text-dark d-flex justify-content-between align-items-center py-2" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <div>
                  <h4 className="mb-0">
                    <i className="bi bi-folder me-2"></i>
                    {currentFolderId ? "Folder Documents" : "My Documents"}
                  </h4>
                  <small className="opacity-75">
                    {total} document(s) found • Page {currentPage} of{" "}
                    {totalPages}
                    {currentFolderId && " • Filtered by folder"}
                  </small>
                </div>
                {/* Đã xóa nút Upload và Refresh ở đây */}
              </Card.Header>
              <Card.Body className="p-0">
                {renderFolderIndicator()}
                
                {error && (
                  <Alert variant="danger" className="m-3 mb-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <span>{error}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-auto"
                        onClick={() => setError("")}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                  </Alert>
                )}
                
                {!error && documents.length === 0 && !loading && (
                  <div className="text-center py-5">
                    <i className="bi bi-folder-x display-1 text-muted"></i>
                    <h5 className="text-muted mt-3">No documents found</h5>
                    <p className="text-muted">
                      {currentFolderId 
                        ? "No documents in this folder." 
                        : "No documents available."
                      }
                    </p>
                  </div>
                )}
                
                {!error && documents.length > 0 && (
                  <>
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th width="50" className="text-center">#</th>
                            <th>Document Name</th>
                            <th width="120">File Type</th>
                            <th width="120">Status</th>
                            <th width="140">Created Date</th>
                            <th width="100">Size</th>
                            <th width="200" className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc, index) => {
                            if (!doc) return null;
                            const fileExtension = getFileExtension(doc);
                            const fileIcon = getFileIcon(fileExtension);
                            const documentId = doc.id || doc.documentId;
                            
                            return (
                              <tr key={documentId || index}>
                                <td className="text-center text-muted">
                                  {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td>
                                  <div
                                    className="d-flex align-items-center cursor-pointer"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleDocumentNameClick(doc)}
                                    title="Click to view document"
                                  >
                                    <i
                                      className={`bi ${fileIcon} text-primary me-2`}
                                      style={{ fontSize: "1.2rem" }}
                                    ></i>
                                    <div>
                                      <strong className="text-primary d-block hover-underline">
                                        {doc.title ||
                                          doc.filename ||
                                          doc.name ||
                                          "Unnamed Document"}
                                      </strong>
                                      {doc.description && (
                                        <small className="text-muted">
                                          {doc.description}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge
                                    bg="outline-secondary"
                                    text="dark"
                                    className="text-uppercase border"
                                  >
                                    {fileExtension}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg={getStatusVariant(doc.status)}>
                                    {doc.status || "unknown"}
                                  </Badge>
                                </td>
                                <td className="text-muted">
                                  {formatDate(doc.createdAt || doc.createdDate)}
                                </td>
                                <td className="text-muted">
                                  {formatFileSize(doc.size)}
                                </td>
                                <td>
                                  <div className="d-flex gap-2 justify-content-center">
                                    <Button
                                      variant="dark"
                                      size="sm"
                                      onClick={() => handleDownload(doc)}
                                      disabled={downloading}
                                      className="d-flex align-items-center btn-prominent"
                                      title="Download Document"
                                    >
                                      {downloading ? (
                                        <Spinner
                                          animation="border"
                                          size="sm"
                                          className="me-1"
                                        />
                                      ) : (
                                        <i className="bi bi-download me-1"></i>
                                      )}
                                      Download
                                    </Button>

                                    {!currentFolderId && (
                                      <Button
                                        variant="dark"
                                        size="sm"
                                        onClick={() => handleMoveClick(doc)}
                                        className="d-flex align-items-center btn-prominent"
                                        title="Move to Folder"
                                      >
                                        <i className="bi bi-folder me-1"></i>
                                        Move
                                      </Button>
                                    )}

                                    <Button
                                      variant="dark"
                                      size="sm"
                                      onClick={() => handleDeleteClick(doc)}
                                      className="d-flex align-items-center btn-prominent"
                                      title="Delete Document"
                                    >
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center p-3 border-top">
                        <div className="d-flex align-items-center">
                          <span className="text-muted me-2">Show:</span>
                          <Form.Select
                            size="sm"
                            style={{ width: "80px" }}
                            value={itemsPerPage}
                            onChange={(e) =>
                              handleItemsPerPageChange(Number(e.target.value))
                            }
                          >
                            <option value={5}>5</option>
                            <option value={7}>7</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </Form.Select>
                          <span className="text-muted ms-2">per page</span>
                        </div>
                        <Pagination className="mb-0">
                          <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                          />
                          {renderPaginationItems()}
                          <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                          />
                        </Pagination>
                        <div className="text-muted">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, total)} of{" "}
                          {total} documents
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
              
              {!error && documents.length > 0 && totalPages === 1 && (
                <Card.Footer className="bg-light d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing {documents.length} of {total} documents
                  </small>
                  <small className="text-muted">
                    Last updated: {new Date().toLocaleTimeString()}
                  </small>
                </Card.Footer>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Các modal vẫn được giữ nguyên để đảm bảo chức năng vẫn hoạt động */}
      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-upload me-2"></i>
            Upload Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {uploadError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {uploadError}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Select File</Form.Label>
              <Form.Control
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.xlsx,.xls,.pptx,.ppt"
                disabled={uploading}
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, DOC, DOCX, TXT, Images, Excel,
                PowerPoint (Max 50MB)
              </Form.Text>
            </Form.Group>
            {selectedFile && (
              <Alert variant="info" className="mb-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark me-2"></i>
                  <div>
                    <strong className="d-block">{selectedFile.name}</strong>
                    <small>
                      Size: {formatFileSize(selectedFile.size)} • Type:{" "}
                      {selectedFile.type || "Unknown"}
                    </small>
                  </div>
                </div>
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUploadModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <i className="bi bi-upload me-2"></i>
                Upload File
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {deleteError}
            </Alert>
          )}
          <p className="mb-3">
            Are you sure you want to delete this document? This action cannot be
            undone.
          </p>
          {documentToDelete && (
            <Alert variant="warning">
              <div className="d-flex align-items-start">
                <i className="bi bi-file-earmark me-2 mt-1"></i>
                <div>
                  <strong className="d-block">
                    {documentToDelete.title ||
                      documentToDelete.filename ||
                      "Unknown Document"}
                  </strong>
                  <small className="text-muted d-block">
                    Type: .{getFileExtension(documentToDelete)} • Size:{" "}
                    {formatFileSize(documentToDelete.size)} • Created:{" "}
                    {formatDate(documentToDelete.createdAt)}
                  </small>
                </div>
              </div>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteConfirm(documentToDelete)}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Delete Document
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showMoveModal}
        onHide={() => setShowMoveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-folder me-2"></i>
            Move Document to Folder
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {moveError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {moveError}
            </Alert>
          )}
          
          {documentToMove && (
            <Alert variant="info" className="mb-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-file-earmark me-2"></i>
                <div>
                  <strong>Document:</strong> {documentToMove.title || documentToMove.filename}
                </div>
              </div>
            </Alert>
          )}

          <Form.Group>
            <Form.Label>Select Folder</Form.Label>
            <Form.Select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
            >
              <option value="">Choose a folder...</option>
              {allFolders.length > 0 ? (
                renderFolderOptions(allFolders)
              ) : (
                <option disabled>No folders available</option>
              )}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowMoveModal(false)}
            disabled={moving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleMoveConfirm}
            disabled={moving || !selectedFolderId}
          >
            {moving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Moving...
              </>
            ) : (
              <>
                <i className="bi bi-folder me-2"></i>
                Move Document
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .cursor-pointer:hover {
          background-color: #f8f9fa;
        }
        .hover-underline:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default DocumentsList;