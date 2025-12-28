import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Clipboard, X, Loader2, Check, Lock, User } from 'lucide-react';
import './App.css'; // See the CSS file below

export default function TokenFetcher() {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [shake, setShake] = useState(false);

  // Load saved data
  useEffect(() => {
    const savedRemember = localStorage.getItem('remember') === 'true';
    if (savedRemember) {
      setUid(localStorage.getItem('uid') || '');
      setPassword(localStorage.getItem('password') || '');
      setRemember(true);
    }
  }, []);

  // Save data logic
  useEffect(() => {
    if (remember) {
      localStorage.setItem('remember', 'true');
      localStorage.setItem('uid', uid);
      localStorage.setItem('password', password);
    } else {
      localStorage.clear();
    }
  }, [uid, password, remember]);

  // Paste / Clear Handler (Fixed for browser security)
  const handlePasteClear = async () => {
    if (password) {
      setPassword('');
      document.getElementById('password-input')?.focus();
    } else {
      try {
        const text = await navigator.clipboard.readText();
        setPassword(text);
        setStatus({ msg: '', type: '' });
      } catch (err) {
        setStatus({ msg: '⚠️ Browser blocked paste. Use Ctrl+V', type: 'warning' });
        document.getElementById('password-input')?.focus();
      }
    }
  };

  const handleFetch = async () => {
    if (!uid || !password) {
      setStatus({ msg: '❌ UID & Password required', type: 'error' });
      setShake(true);
      setTimeout(() => setShake(false), 500); // Reset shake
      return;
    }

    setLoading(true);
    setToken('');
    setStatus({ msg: '🌐 Connecting...', type: 'info' });

    const targetUrl = `https://raihan-access-to-jwt.vercel.app/token?uid=${encodeURIComponent(uid)}&password=${encodeURIComponent(password)}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
      const res = await fetch(proxyUrl);
      const text = await res.text();
      setToken(text);

      if (res.ok) {
        setStatus({ msg: '✅ Token fetched successfully', type: 'success' });
      } else {
        setStatus({ msg: '❌ Fetch failed', type: 'error' });
      }
    } catch (e) {
      setToken(e.message);
      setStatus({ msg: '⚠️ Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    let textToCopy = token;
    try
    