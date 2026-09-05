import React, { useState } from "react";
import {
  FolderOpen,
  FileDown,
  FileText,
  Download,
  Eye,
  CheckCircle,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { getMaterialsForTopic, downloadFile } from "../../utils/learningHistory";
import "./Views.css";

export default function MaterialsView({ searchHistory = [], onNavigateTab }) {
  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState("");

  // Flatten all materials across past search history
  const allMaterials = searchHistory.flatMap((histItem) => {
    return getMaterialsForTopic(histItem).map((mat) => ({
      ...mat,
      parentTopic: histItem.topic,
      parentTopicId: histItem.id,
      teacherName: histItem.teacherName,
    }));
  });

  const filteredMaterials = allMaterials.filter((mat) => {
    const matchesTopic =
      selectedTopicId === "all" || mat.parentTopicId === selectedTopicId;
    const matchesQuery =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.parentTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  const handleDownload = (material) => {
    downloadFile(material.filename, material.content, material.mimeType);
    setDownloadSuccessToast(`Downloaded: ${material.filename}`);
    setTimeout(() => setDownloadSuccessToast(""), 3500);
  };

  const handleDownloadAll = () => {
    if (filteredMaterials.length === 0) return;
    filteredMaterials.forEach((m, idx) => {
      setTimeout(() => {
        downloadFile(m.filename, m.content, m.mimeType);
      }, idx * 250);
    });
    setDownloadSuccessToast(`Downloading ${filteredMaterials.length} material files...`);
    setTimeout(() => setDownloadSuccessToast(""), 4000);
  };

  return (
    <div className="view-page-container">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#1E293B",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <CheckCircle size={16} color="#10B981" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Study Materials & Lecture Downloads</h1>
          <p>
            Download structured lecture notes, revision cheat sheets, and formula guides generated from your past searches.
          </p>
        </div>
        <div className="view-hero-actions">
          {filteredMaterials.length > 0 && (
            <button
              type="button"
              className="resume-lesson-btn"
              onClick={handleDownloadAll}
              title="Download all listed materials"
            >
              <Download size={14} />
              <span>Download All ({filteredMaterials.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="view-search-toolbar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search notes, formulas, or cheat sheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-chips">
          <button
            type="button"
            className={`chip-btn ${selectedTopicId === "all" ? "is-active" : ""}`}
            onClick={() => setSelectedTopicId("all")}
          >
            All Past Searches
          </button>
          {searchHistory.map((hist) => (
            <button
              key={hist.id}
              type="button"
              className={`chip-btn ${selectedTopicId === hist.id ? "is-active" : ""}`}
              onClick={() => setSelectedTopicId(hist.id)}
            >
              {hist.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="view-hero-header" style={{ flexDirection: "column", textAlign: "center", padding: "40px" }}>
          <FolderOpen size={40} color="var(--color-primary)" style={{ opacity: 0.8, marginBottom: 10 }} />
          <h3>No study materials found</h3>
          <p>Complete a lesson or search a new topic to automatically generate downloadable study notes.</p>
          <button
            type="button"
            className="resume-lesson-btn"
            style={{ marginTop: 14 }}
            onClick={() => onNavigateTab("home")}
          >
            Search a Topic
          </button>
        </div>
      ) : (
        <div className="materials-list-container">
          {filteredMaterials.map((mat) => (
            <article key={mat.id} className="material-item-card">
              <div className="material-item-left">
                <div className="material-type-icon-pill">
                  <FileText size={22} />
                </div>
                <div className="material-meta-details">
                  <h3>{mat.title}</h3>
                  <p>{mat.description}</p>
                  <div className="material-sub-badges">
                    <span className="badge-pill">{mat.parentTopic}</span>
                    <span className="badge-pill">{mat.type}</span>
                    <span>{mat.format.toUpperCase()} • {mat.size}</span>
                    <span>Taught by {mat.teacherName}</span>
                  </div>
                </div>
              </div>

              <div className="material-actions-group">
                <button
                  type="button"
                  className="action-icon-btn"
                  onClick={() => setPreviewItem(mat)}
                  title="Preview document in browser"
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  className="download-pill-btn"
                  onClick={() => handleDownload(mat)}
                  title={`Download ${mat.filename}`}
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* In-Browser Document Preview Modal */}
      {previewItem && (
        <div
          className="doc-preview-modal-backdrop"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="doc-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-preview-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{previewItem.title}</h3>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {previewItem.parentTopic} • {previewItem.filename}
                </span>
              </div>
              <button
                type="button"
                className="action-icon-btn"
                onClick={() => setPreviewItem(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="doc-preview-body">
              {previewItem.content}
            </div>

            <div className="doc-preview-footer">
              <button
                type="button"
                className="chip-btn"
                onClick={() => setPreviewItem(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="resume-lesson-btn"
                onClick={() => handleDownload(previewItem)}
              >
                <Download size={14} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
