import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const YouTubeEmbed = ({ url, startSeconds = 0 }) => {
  const idMatch = (url || '').match(/[?&]v=([^&#]+)/) || (url || '').match(/youtu\.be\/([^?&#]+)/);
  const videoId = idMatch ? idMatch[1] : null;
  if (!videoId) return <div className="text-gray-600">Invalid YouTube URL</div>;
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        title="YouTube"
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}?start=${Math.max(0, parseInt(startSeconds || 0))}&rel=0&modestbranding=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const PdfViewer = ({ url }) => {
  if (!url) return <div className="text-gray-600">No PDF provided</div>;
  return (
    <div className="w-full h-[60vh]">
      <iframe title="PDF" src={url} className="w-full h-full rounded-lg border" />
    </div>
  );
};

const TextViewer = ({ text }) => {
  if (!text) return <div className="text-gray-600">No text content</div>;
  return (
    <div className="prose max-w-none">
      <pre className="whitespace-pre-wrap text-gray-800">{text}</pre>
    </div>
  );
};

const ImageGallery = ({ files }) => {
  const imgs = Array.isArray(files) ? files.filter(f => (f.fileType || '').startsWith('image') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.url || '')) : [];
  if (!imgs.length) return <div className="text-gray-600">No images</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {imgs.map((img, idx) => (
        <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="block group">
          <img src={img.url} alt={img.filename || `image-${idx}`} className="rounded-lg w-full h-40 object-cover group-hover:opacity-90" />
        </a>
      ))}
    </div>
  );
};

const Html5Video = ({ src }) => {
  const videoRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);
  return (
    <div>
      <video ref={videoRef} controls className="w-full rounded-lg">
        <source src={src} />
        Your browser does not support the video tag.
      </video>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-gray-600">Speed</span>
        <select className="input-field w-28" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

const CoursePlayer = () => {
  const { id } = useParams();
  const { currentCourse, modules, assignments, fetchCourse, fetchModules, fetchAssignments } = useCourses();
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeContentIdx, setActiveContentIdx] = useState(0);
  const [videoStart, setVideoStart] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchCourse(id);
    fetchModules(id);
  }, [id, fetchCourse, fetchModules]);

  const activeModule = useMemo(() => (modules && modules[activeModuleIdx]) || null, [modules, activeModuleIdx]);
  const activeContent = useMemo(() => (Array.isArray(activeModule?.content) && activeModule.content[activeContentIdx]) || null, [activeModule, activeContentIdx]);

  useEffect(() => {
    if (!activeModule?._id) return;
    fetchAssignments(activeModule._id);
  }, [activeModule?._id, fetchAssignments]);

  useEffect(() => { setVideoStart(0); }, [activeContentIdx, activeModule?._id]);

  const isYouTubeUrl = (u) => /youtu(\.be|be\.com)\//i.test(u || '');

  // Time tracking ping every 30s while viewing
  useEffect(() => {
    if (!id) return;
    if (!activeModule?._id) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
    const tick = async () => {
      try {
        await axios.post(`${API_URL}/courses/${id}/track`, { moduleId: activeModule._id, seconds: 30 }, { headers });
      } catch (_) { /* ignore */ }
    };
    tick();
    const handle = setInterval(tick, 30000);
    return () => clearInterval(handle);
  }, [id, activeModule?._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{currentCourse?.title || 'Course Player'}</h1>
          <div className="card">
            {!activeContent && (
              <div className="text-gray-600">No content in this module.</div>
            )}
            {activeContent?.type === 'video' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{activeContent.title || 'Video'}</h3>
                {isYouTubeUrl(activeContent.url)
                  ? <YouTubeEmbed url={activeContent.url} startSeconds={videoStart} />
                  : <Html5Video src={activeContent.url} />
                }
              </div>
            )}
            {activeContent?.type === 'pdf' && (
              <PdfViewer url={activeContent.url} />
            )}
            {activeContent?.type === 'text' && (
              <TextViewer text={activeContent.text || activeContent.body || activeContent.content} />
            )}
            {activeContent?.type === 'image' && (
              Array.isArray(activeContent.files) && activeContent.files.length > 0
                ? <ImageGallery files={activeContent.files} />
                : <ImageGallery files={[{ url: activeContent.url, filename: activeContent.title || 'image', fileType: activeContent.fileType || '' }]} />
            )}
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Module Description</h2>
            <p className="text-gray-700">{activeModule?.description || 'No description'}</p>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignments</h2>
            <ul className="divide-y divide-gray-100">
              {(assignments || []).map((a) => (
                <li key={a._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">{a.title}</div>
                    <div className="text-sm text-gray-600">Due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : '—'}</div>
                  </div>
                  <a href={`/assignments/${a._id}/submit`} className="btn-outline text-sm">Submit</a>
                </li>
              ))}
              {(!assignments || assignments.length === 0) && (
                <li className="py-3 text-sm text-gray-600">No assignments for this module.</li>
              )}
            </ul>
          </div>
          {activeContent?.type === 'video' && Array.isArray(activeContent?.chapters) && activeContent.chapters.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Chapters</h2>
              <ul className="divide-y divide-gray-100">
                {activeContent.chapters.map((ch, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <div className="text-gray-800">{ch.title}</div>
                    <button className="btn-outline text-xs" onClick={() => setVideoStart(parseInt(ch.time || 0))}>{new Date((ch.time || 0) * 1000).toISOString().substring(11, 19)}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Modules</h3>
            <div className="space-y-4">
              <ul className="divide-y divide-gray-100">
                {(modules || []).map((m, idx) => (
                  <li key={m._id || idx} className={`py-3 px-2 rounded cursor-pointer ${idx === activeModuleIdx ? 'bg-primary-50' : 'hover:bg-gray-50'}`} onClick={() => { setActiveModuleIdx(idx); setActiveContentIdx(0); }}>
                    <div className="text-gray-900 font-medium">{m.title}</div>
                    <div className="text-sm text-gray-600">{m.description}</div>
                  </li>
                ))}
                {(!modules || modules.length === 0) && (
                  <li className="py-4 text-sm text-gray-600">No modules yet.</li>
                )}
              </ul>
              <div className="">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contents</h4>
                <ul className="space-y-2">
                  {(activeModule?.content || []).map((c, cIdx) => (
                    <li key={cIdx} className={`px-2 py-2 rounded text-sm cursor-pointer ${cIdx === activeContentIdx ? 'bg-primary-50' : 'hover:bg-gray-50'}`} onClick={() => setActiveContentIdx(cIdx)}>
                      <span className="uppercase text-xs text-gray-500 mr-2">{c.type}</span>
                      <span className="text-gray-800">{c.title || c.name || c.type}</span>
                    </li>
                  ))}
                  {(!activeModule?.content || activeModule.content.length === 0) && (
                    <li className="text-sm text-gray-600">No contents in this module.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;



