import { Modal, Spinner, Alert, Button } from "react-bootstrap";
import mermaid from "mermaid";
import { useEffect, useRef } from "react";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "forest",
  mindmap: { useMaxWidth: true },
});

const MermaidDiagramModal = ({ show, onClose, diagramCode, error }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!show || !diagramCode) return;

    const timer = setTimeout(() => {
      if (containerRef.current) {
        try {
          mermaid.render("mindmap_svg_id", diagramCode).then(({ svg }) => {
            containerRef.current.innerHTML = svg;
          });
        } catch (e) {
          console.error("Mermaid render error:", e);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [show, diagramCode]);

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-diagram-3 me-2 text-primary"></i>
          AI Generated Diagram
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
      {error && <Alert variant="warning">{error}</Alert>}


        {!diagramCode && !error && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="text-muted mt-2">Loading diagram...</p>
          </div>
        )}

        <div
          ref={containerRef}
          style={{
            width: "100%",
            minHeight: "600px",
            background: "#111827",
            padding: "20px",
            borderRadius: "10px",
            overflow: "auto",
          }}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>

        {diagramCode && (
          <Button
            variant="dark"
            onClick={() => {
              const blob = new Blob([diagramCode], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "diagram.mmd";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <i className="bi bi-download me-2"></i>
            Download Mermaid Code
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MermaidDiagramModal;
