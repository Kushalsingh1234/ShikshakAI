import React, { useState } from "react";
import { GraduationCap, Play, Search, Clock, Award, Sparkles, BookOpen } from "lucide-react";
import "./Views.css";

const CURATED_LESSONS = [
  {
    id: "cur_linear_eq",
    topic: "Linear Equations & Inverses",
    category: "Mathematics",
    teacherName: "Dr. Maya",
    level: "Beginner",
    duration: "20 min",
    description: "Systematic isolation of variables, inverse operations, and standard slope forms.",
    tags: ["Algebra", "Equations", "Foundations"],
  },
  {
    id: "cur_java_oop",
    topic: "Java OOP & Polymorphism",
    category: "Computer Science",
    teacherName: "Prof. Alex",
    level: "Intermediate",
    duration: "25 min",
    description: "Classes, interfaces, inheritance hierarchies, runtime polymorphism, and super methods.",
    tags: ["Java", "OOP", "Software Design"],
  },
  {
    id: "cur_newton",
    topic: "Newton's Laws of Motion",
    category: "Physics",
    teacherName: "Dr. Maya",
    level: "Beginner",
    duration: "30 min",
    description: "Inertia, dynamic force equations F=ma, and equal-opposite reaction mechanics.",
    tags: ["Mechanics", "Forces", "Physics"],
  },
  {
    id: "cur_calculus",
    topic: "Derivatives & Rate of Change",
    category: "Mathematics",
    teacherName: "Prof. Alex",
    level: "Intermediate",
    duration: "25 min",
    description: "Geometric tangent slopes, the limit definition of the derivative, and power rule shortcuts.",
    tags: ["Calculus", "Derivatives", "Math"],
  },
  {
    id: "cur_binary_search",
    topic: "Binary Search & Sorting",
    category: "Computer Science",
    teacherName: "Prof. Alex",
    level: "Intermediate",
    duration: "20 min",
    description: "Logarithmic divide-and-conquer on sorted datasets, edge pointers, and algorithmic complexity.",
    tags: ["Algorithms", "Data Structures", "Big-O"],
  },
  {
    id: "cur_photosynthesis",
    topic: "Photosynthesis & Cellular Energy",
    category: "Biology",
    teacherName: "Dr. Maya",
    level: "Beginner",
    duration: "20 min",
    description: "Light-dependent reactions in chloroplasts, ATP synthesis, and the Calvin cycle.",
    tags: ["Biology", "Bioenergetics", "Cellular"],
  },
];

export default function LessonsCatalogView({ onStartLesson, onNavigateTab }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Mathematics", "Computer Science", "Physics", "Biology"];

  const filtered = CURATED_LESSONS.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="view-page-container">
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <h1>Interactive Curriculum Lessons</h1>
          <p>Explore structured AI-guided modules with live 3D visual concepts, voice narration, and checkpoints.</p>
        </div>
        <div className="view-hero-actions">
          <button
            type="button"
            className="resume-lesson-btn"
            onClick={() => onNavigateTab("home")}
          >
            <Sparkles size={14} />
            <span>Custom Topic Studio</span>
          </button>
        </div>
      </div>

      <div className="view-search-toolbar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Filter catalog lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="category-filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip-btn ${selectedCategory === cat ? "is-active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="history-cards-grid">
        {filtered.map((lesson) => (
          <article key={lesson.id} className="history-card">
            <div>
              <div className="history-card-header">
                <span className="category-tag">{lesson.category}</span>
                <span className="badge-pill">{lesson.level}</span>
              </div>
              <h3 className="history-topic-title">{lesson.topic}</h3>
              <p className="history-topic-summary">{lesson.description}</p>
              <div className="history-meta-bar">
                <span><GraduationCap size={13} /> {lesson.teacherName}</span>
                <span><Clock size={13} /> {lesson.duration}</span>
              </div>
            </div>
            <button
              type="button"
              className="resume-lesson-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => onStartLesson({ topic: lesson.topic, learner_level: lesson.level.toLowerCase() })}
            >
              <Play size={14} />
              <span>Launch Studio Lesson</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
