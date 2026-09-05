import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Play,
  Search,
  Clock,
  Award,
  Sparkles,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Layers,
  ChevronRight,
  PlusCircle,
  Trash2,
  ListOrdered,
} from "lucide-react";
import {
  getStoredCourses,
  saveCourse,
  updateCourseTopicProgress,
  deleteCourse,
  generateCurriculumForTopic,
} from "../../services/courseStorage";
import "./Views.css";

export default function CoursesCatalogView({
  onStartLesson,
  onNavigateTab,
  initialSelectedCourseId = null,
}) {
  const [courses, setCourses] = useState(() => getStoredCourses());
  const [selectedCourseId, setSelectedCourseId] = useState(initialSelectedCourseId);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setCourses(getStoredCourses());
  }, []);

  // Sync if initialSelectedCourseId changes
  useEffect(() => {
    if (initialSelectedCourseId) {
      setSelectedCourseId(initialSelectedCourseId);
    }
  }, [initialSelectedCourseId]);

  const categories = ["All", "Computer Science", "Mathematics", "Physics", "General Studies"];

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const handleToggleTopic = (topicId, currentVal, e) => {
    e.stopPropagation();
    if (!selectedCourse) return;
    const updated = updateCourseTopicProgress(selectedCourse.id, topicId, !currentVal);
    setCourses(updated);
  };

  const handleDeleteCourse = (courseId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this course?")) {
      const updated = deleteCourse(courseId);
      setCourses(updated);
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.topic.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate course completion stats
  const getCourseStats = (course) => {
    const total = course.topics?.length || 0;
    const completed = course.topics?.filter((t) => t.isCompleted).length || 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  // =========================================================================
  // VIEW 1: SINGLE COURSE SYLLABUS DETAIL (TOPIC-BY-TOPIC VIEW)
  // =========================================================================
  if (selectedCourse) {
    const { total, completed, percent } = getCourseStats(selectedCourse);

    return (
      <div className="view-page-container">
        {/* Back navigation & Course Top Banner */}
        <div className="course-detail-header">
          <div className="course-detail-top-nav">
            <button
              type="button"
              className="course-back-btn"
              onClick={() => setSelectedCourseId(null)}
            >
              <ArrowLeft size={16} />
              <span>Back to All Courses</span>
            </button>
            <div className="course-header-tags">
              <span className="category-tag">{selectedCourse.category}</span>
              <span className="badge-pill">{selectedCourse.level}</span>
            </div>
          </div>

          <div className="course-detail-main-info">
            <div className="course-title-block">
              <h1 className="course-detail-title">{selectedCourse.title}</h1>
              <p className="course-detail-desc">{selectedCourse.description}</p>
            </div>

            <div className="course-progress-card">
              <div className="progress-card-meta">
                <span className="progress-label">Course Progress</span>
                <span className="progress-number">
                  {completed} / {total} Topics ({percent}%)
                </span>
              </div>
              <div className="course-progress-track">
                <div
                  className="course-progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="progress-card-sub">
                <span>Total Duration: ~{selectedCourse.duration}</span>
                {percent === 100 && <span className="completed-tag">Mastered 🎉</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Topic-by-Topic Syllabus List */}
        <div className="course-syllabus-section">
          <div className="syllabus-section-header">
            <div className="syllabus-title-wrap">
              <ListOrdered size={18} className="section-icon" />
              <h2>Curriculum Syllabus ({total} Topics)</h2>
            </div>
            <p className="syllabus-sub">
              Learn each topic sequentially with Dr. Maya and live visual derivations.
            </p>
          </div>

          <div className="course-topics-stack">
            {selectedCourse.topics.map((topic, idx) => {
              const numStr = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={topic.id}
                  className={`course-topic-card ${topic.isCompleted ? "is-completed" : ""}`}
                >
                  {/* Topic Sequence Number or Checkmark */}
                  <button
                    type="button"
                    className={`topic-completion-toggle ${topic.isCompleted ? "is-done" : ""}`}
                    onClick={(e) => handleToggleTopic(topic.id, topic.isCompleted, e)}
                    title={topic.isCompleted ? "Mark as uncompleted" : "Mark as completed"}
                  >
                    {topic.isCompleted ? (
                      <CheckCircle2 size={22} className="check-icon" />
                    ) : (
                      <div className="topic-num-badge">{numStr}</div>
                    )}
                  </button>

                  {/* Topic Details */}
                  <div className="topic-info-col">
                    <div className="topic-header-line">
                      <span className="topic-step-tag">Topic {numStr}</span>
                      <span className="topic-duration-tag">
                        <Clock size={12} /> {topic.duration}
                      </span>
                      {topic.isCompleted && (
                        <span className="topic-status-badge done">Completed</span>
                      )}
                    </div>
                    <h3 className="topic-card-title">{topic.title}</h3>
                    <p className="topic-card-desc">{topic.description}</p>
                  </div>

                  {/* Action: Learn Topic */}
                  <div className="topic-action-col">
                    <button
                      type="button"
                      className="learn-topic-btn"
                      onClick={() =>
                        onStartLesson({
                          topic: topic.title,
                          learner_level: selectedCourse.level.toLowerCase().includes("adv")
                            ? "advanced"
                            : "beginner",
                        })
                      }
                      title={`Launch AI Studio for ${topic.title}`}
                    >
                      <Play size={14} className="play-icon" />
                      <span>{topic.isCompleted ? "Review Topic" : "Learn Topic"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ALL COURSES CATALOG GRID
  // =========================================================================
  return (
    <div className="view-page-container">
      {/* Top Hero Header */}
      <div className="view-hero-header">
        <div className="view-hero-meta">
          <div className="hero-badge-row">
            <span className="curated-catalog-badge">
              <Layers size={13} /> Multi-Topic Curriculums
            </span>
          </div>
          <h1>All AI Courses</h1>
          <p>
            Master entire subjects topic-by-topic with structured lesson syllabi, 3D visual concepts, and interactive checkpoints.
          </p>
        </div>
        <div className="view-hero-actions">
          <button
            type="button"
            className="resume-lesson-btn"
            onClick={() => onNavigateTab("home")}
          >
            <PlusCircle size={14} />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Toolbar with Search and Category Filter */}
      <div className="view-search-toolbar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search courses by topic, title, or keywords..."
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

      {/* Course Cards Grid */}
      <div className="courses-cards-grid">
        {filteredCourses.map((course) => {
          const { total, completed, percent } = getCourseStats(course);

          return (
            <article
              key={course.id}
              className="course-catalog-card"
              onClick={() => setSelectedCourseId(course.id)}
            >
              <div className="course-card-top">
                <div className="course-card-badges">
                  <span className="category-tag">{course.category}</span>
                  <span className="badge-pill">{course.level}</span>
                </div>
                {course.id.startsWith("course_") && !["course_c_language", "course_linear_algebra", "course_python_oop", "course_physics_newton"].includes(course.id) && (
                  <button
                    type="button"
                    className="delete-course-btn"
                    onClick={(e) => handleDeleteCourse(course.id, e)}
                    title="Remove custom course"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <h3 className="course-card-title">{course.title}</h3>
              <p className="course-card-description">{course.description}</p>

              {/* Progress Mini Bar */}
              <div className="course-card-progress-wrap">
                <div className="card-progress-info">
                  <span>Progress</span>
                  <span>{percent}% ({completed}/{total} Topics)</span>
                </div>
                <div className="card-progress-track">
                  <div
                    className="card-progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="course-card-meta-bar">
                <span>
                  <Layers size={13} /> {total} Topics
                </span>
                <span>
                  <Clock size={13} /> {course.duration}
                </span>
              </div>

              <button
                type="button"
                className="view-course-topics-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourseId(course.id);
                }}
              >
                <span>View Syllabus ({total} Topics)</span>
                <ChevronRight size={14} />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
