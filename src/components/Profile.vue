.profile-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: #333;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #444;
}

.profile-details {
  flex: 1;
}

.profile-name {
  color: #e0e7ef;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.profile-bio {
  color: #a0aec0;
  margin-bottom: 1rem;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  color: #e0e7ef;
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-label {
  color: #a0aec0;
  font-size: 0.9rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-follow {
  background: #4CAF50;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-follow:hover {
  background: #388E3C;
}

.btn-following {
  background: #666;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-following:hover {
  background: #777;
}

.profile-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-card {
  background: #333;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
}

.section-title {
  color: #e0e7ef;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #444;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.skill-item {
  background: #444;
  color: #e0e7ef;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-item {
  background: #444;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.project-item:hover {
  transform: translateY(-2px);
}

.project-title {
  color: #e0e7ef;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.project-description {
  color: #a0aec0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.project-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.stack-item {
  background: #555;
  color: #e0e7ef;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  background: #444;
  border-radius: 8px;
  padding: 1rem;
}

.post-content {
  color: #e0e7ef;
  margin-bottom: 0.5rem;
}

.post-meta {
  color: #a0aec0;
  font-size: 0.9rem;
}

.post-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.post-action {
  color: #a0aec0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s;
}

.post-action:hover {
  color: #e0e7ef;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .profile-actions {
    justify-content: center;
  }
} 