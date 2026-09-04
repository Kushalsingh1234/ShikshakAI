import React from "react";
import { TEACHERS } from "../../constants/teachers";

export default function EducatorPreview({ selectedTeacher = TEACHERS[0] }) {
  const teacherFirstName = selectedTeacher.name.split(" ")[0].toUpperCase();

  return (
    <div className="educator-preview-card" aria-label="AI Educator Preview">
      {/* Card Header */}
      <div className="preview-card-header">
        <span className="preview-card-label">Your AI Educator</span>
      </div>

      {/* Controlled-Blue Educational Illustration */}
      <div className="preview-portrait-stage">
        <div className="preview-svg-wrapper">
          {selectedTeacher.id === "prof-alex" ? (
            /* Prof. Alex - Programming & Algorithms */
            <svg viewBox="0 0 240 240" className="educator-vector-illustration" aria-hidden="true">
              <defs>
                <linearGradient id="alexBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EEF1FF" />
                  <stop offset="100%" stopColor="#DCE3FA" />
                </linearGradient>
                <linearGradient id="alexCoat" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#30458F" />
                  <stop offset="100%" stopColor="#1F2C5C" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r="102" fill="url(#alexBg)" />
              <path d="M48 222 C54 172 84 152 120 152 C156 152 186 172 192 222 Z" fill="url(#alexCoat)" />
              <path d="M102 152 L120 186 L138 152 Z" fill="#4F63C8" />
              <path d="M109 152 L120 174 L131 152 Z" fill="#FFFFFF" />
              <rect x="108" y="128" width="24" height="26" rx="4" fill="#E8D1BE" />
              <ellipse cx="120" cy="108" rx="34" ry="40" fill="#F4DEC9" />
              <path d="M84 100 C84 66 100 62 120 62 C140 62 156 66 156 100 C152 86 142 76 120 76 C98 76 88 86 84 100 Z" fill="#2B3A67" />
              <circle cx="86" cy="108" r="6" fill="#E8D1BE" />
              <circle cx="154" cy="108" r="6" fill="#E8D1BE" />
              <circle cx="107" cy="105" r="3" fill="#171A24" />
              <circle cx="133" cy="105" r="3" fill="#171A24" />
              <path d="M100 96 Q107 94 114 96" stroke="#2B3A67" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M126 96 Q133 94 140 96" stroke="#2B3A67" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M113 124 Q120 129 127 124" stroke="#8C6F5A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="168" cy="74" r="14" fill="#4F63C8" />
              <text x="168" y="78.5" fill="#FFFFFF" fontSize="10.5" fontWeight="700" textAnchor="middle">&lt;/&gt;</text>
            </svg>
          ) : selectedTeacher.id === "ananya" ? (
            /* Ananya Ma'am - Humanities & Languages */
            <svg viewBox="0 0 240 240" className="educator-vector-illustration" aria-hidden="true">
              <defs>
                <linearGradient id="ananyaBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EEF1FF" />
                  <stop offset="100%" stopColor="#E0E6FC" />
                </linearGradient>
                <linearGradient id="ananyaDress" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F63C8" />
                  <stop offset="100%" stopColor="#30458F" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r="102" fill="url(#ananyaBg)" />
              <path d="M50 222 C56 174 84 154 120 154 C156 154 184 174 190 222 Z" fill="url(#ananyaDress)" />
              <path d="M72 170 C92 186 108 206 112 222 L80 222 Z" fill="#6B82E8" opacity="0.85" />
              <rect x="110" y="126" width="20" height="28" rx="4" fill="#D9B79B" />
              <ellipse cx="120" cy="106" rx="33" ry="39" fill="#ECCBB0" />
              <path d="M85 102 C85 64 102 60 120 60 C138 60 155 64 155 102 C155 120 151 134 147 140 C141 126 143 90 120 86 C97 90 99 126 93 140 Z" fill="#1C2237" />
              <ellipse cx="120" cy="56" rx="18" ry="12" fill="#1C2237" />
              <circle cx="120" cy="94" r="2.2" fill="#C23B38" />
              <ellipse cx="107" cy="106" rx="3.5" ry="2.5" fill="#171A24" />
              <ellipse cx="133" cy="106" rx="3.5" ry="2.5" fill="#171A24" />
              <path d="M101 98 Q107 95 113 98" stroke="#1C2237" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M127 98 Q133 95 139 98" stroke="#1C2237" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M113 122 Q120 127 127 122" stroke="#8C6F5A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="168" cy="74" r="14" fill="#30458F" />
              <text x="168" y="78.5" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">क</text>
            </svg>
          ) : (
            /* Dr. Maya - STEM & Science (Default) */
            <svg viewBox="0 0 240 240" className="educator-vector-illustration" aria-hidden="true">
              <defs>
                <linearGradient id="mayaBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EEF1FF" />
                  <stop offset="100%" stopColor="#DCE3FA" />
                </linearGradient>
                <linearGradient id="mayaJacket" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#30458F" />
                  <stop offset="100%" stopColor="#223062" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r="102" fill="url(#mayaBg)" />
              <path d="M48 222 C54 170 82 150 120 150 C158 150 186 170 192 222 Z" fill="url(#mayaJacket)" />
              <path d="M100 150 L120 190 L140 150 Z" fill="#4F63C8" />
              <path d="M107 150 L120 176 L133 150 Z" fill="#FFFFFF" />
              <rect x="108" y="124" width="24" height="26" rx="4" fill="#E6C8B2" />
              <ellipse cx="120" cy="104" rx="33" ry="39" fill="#F8DFCB" />
              <path d="M84 98 C84 60 100 54 120 54 C140 54 156 60 156 98 C156 124 148 132 142 134 C142 116 140 82 120 80 C100 82 98 116 98 134 C92 132 84 124 84 98 Z" fill="#202A4A" />
              <circle cx="87" cy="106" r="6" fill="#E6C8B2" />
              <circle cx="153" cy="106" r="6" fill="#E6C8B2" />
              {/* Modern Sleek Glasses */}
              <rect x="95" y="96" width="20" height="14" rx="3" fill="none" stroke="#4F63C8" strokeWidth="2" />
              <rect x="125" y="96" width="20" height="14" rx="3" fill="none" stroke="#4F63C8" strokeWidth="2" />
              <line x1="115" y1="102" x2="125" y2="102" stroke="#4F63C8" strokeWidth="2" />
              <circle cx="105" cy="103" r="2.6" fill="#171A24" />
              <circle cx="135" cy="103" r="2.6" fill="#171A24" />
              <path d="M113 122 Q120 126 127 122" stroke="#8C6F5A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="168" cy="74" r="14" fill="#4F63C8" />
              <text x="168" y="78.5" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">∑</text>
            </svg>
          )}
        </div>
      </div>

      {/* Educator Name & Specialization */}
      <div className="preview-info-block">
        <h3 className="preview-educator-name">{selectedTeacher.name}</h3>
        <span className="preview-educator-specialty">{selectedTeacher.specialty}</span>
        <p className="preview-educator-description">
          Your AI educator adapts explanations, questions, and difficulty as you learn.
        </p>
      </div>

      {/* Subtle Conversation Preview Quote */}
      <div className="preview-quote-box">
        <span className="quote-speaker-tag">{selectedTeacher.name.toUpperCase()}</span>
        <p className="quote-text-body">
          "Ready when you are. Tell me what you'd like to understand."
        </p>
      </div>
    </div>
  );
}
