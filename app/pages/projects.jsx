"use client";
import { marked } from "marked";
import React, { useState, useEffect, useRef } from "react";
import frames from '../assets/frames';
import badappleAudio from '../assets/badapple.mp3';
import { exit } from "process";

export default function TerminalPortfolio() {
  const [output, setOutput] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(null);
  const [repos, setRepos] = useState(null);
  const [rootAccess, setRootAccess] = useState(false);
  const githubUser = "satvikprsd";
  const [token] = useState(null);
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const badappleid = useRef(null);
  const badappleAudioRef = useRef(null);

  const append = (text) => {
    setOutput((prev) => [...prev, text]);
  };

  const replace = (lines) => {
    setOutput(lines);
  };

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }
  }, [output]);

  const escapeHtml = (text) =>
    text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  const apiFetch = async (url) => {
    const headers = { Accept: "application/vnd.github.v3+json",Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`};
    if (token) headers.Authorization = `token ${token}`;
    const r = await fetch(url, { headers });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub API error: ${r.status}`);
    return r.json();
  };

  const fetchRepos = async () => {
    const url = `https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`;
    try {
      const data = await apiFetch(url);
      setRepos(data || []);
      return data || [];
    } catch (e) {
      append(`Error fetching repos: ${e.message}`);
      return [];
    }
  };

  const ensureRepos = async () => {
    if (!repos) {
      return await fetchRepos();
    }
    return repos;
  };

  const commands = {
    help: () =>
      `Available commands:\n\nhelp, about, ls, repo <name>, readme <name>, contact, clear, su <username> <password>, badapple`,
    about: () => `Hi — I'm Satvik Prasad. This is my implementation of a terminal style portfolio.`,
    whoami: () => `${rootAccess ? "root" : "guest"}`,
    su: (args) => {
      if (rootAccess && !args[0]) {setRootAccess(false); return "Switched to guest.";};
      if (!args[0]) return `Usage: su ${escapeHtml('<username> <password>')}`;
      if (args[0] === "root" && args[1] === "root") {
        setRootAccess(true);
        return "Root access granted.";
      }
      return "Access denied.";
    },
    badapple: () => {
      let i = 0;
      const fps = 30;
      const interval = 1000/fps;

      badappleAudioRef.current = new Audio(badappleAudio);

      badappleid.current = setInterval(() => {
        if (!badappleAudioRef.current.paused) {
          const targetFrame = Math.floor(badappleAudioRef.current.currentTime*fps);

          if (targetFrame>=frames.length) {
            clearInterval(badappleid.current);
            badappleid.current = null;
            replace([]);
            append("Bad Apple finished!");
            return;
          }

          if (targetFrame!==i) {
            i = targetFrame;
            replace(frames[i]);
          }
        }
      }, interval);

      badappleAudioRef.current.play();

      return "Playing Bad Apple… (Ctrl+C) to stop.";
    },
    contact: () => `Email: <a className="hover:cursor-pointer" href="mailto:satvikprsd@gmail.com" target="_blank" rel="noopener noreferrer">satvikprsd@gmail.com</a>\nGitHub: <a className="hover:cursor-pointer" href="https://github.com/${githubUser}" target="_blank" rel="noopener noreferrer">https://github.com/${githubUser}</a>`,
    neofetch: () => {
      // console.log(navigator)
      const ascii = `
        <span className="text-[2px]" style="color:#ff5555">   ___________       guest@portfolio</span>
        <span className="text-[2px]" style="color:#ff5555">  |.---------.|      ---------------</span>
        <span className="text-[2px]" style="color:#50fa7b">  ||         ||     OS: Web (Next.js)</span>
        <span className="text-[2px]" style="color:#50fa7b">  ||         ||     Host: Portfolio Web</span>
        <span className="text-[2px]" style="color:#8be9fd">  ||         ||     Kernel: JavaScript</span>
        <span className="text-[2px]" style="color:#8be9fd">  |'---------'|     Uptime: ${Math.floor(performance.now()/3600000)}h ${Math.floor((performance.now()/60000)%60)}m ${Math.floor((performance.now()/1000)%60)}s</span>
        <span className="text-[2px]" style="color:#f1fa8c">  \`)__ ____('       Shell: ${rootAccess ? 'root' : 'guest'}</span>
        <span className="text-[2px]" style="color:#f1fa8c">   [=== -- o ]--.   Resolution: ${window.innerWidth}x${window.innerHeight}</span>
        <span className="text-[2px]" style="color:#bd93f9"> __'---------'__ \\  DE: Browser</span>
        <span className="text-[2px]" style="color:#bd93f9">[::::::::::: :::] ) Platform: ${navigator.platform}</span>
        <span className="text-[2px]" style="color:#ff79c6">\`""'"""""'""""\`/T\\  CPU: Web Processor</span>
        <span className="text-[2px]" style="color:#ff79c6">               \\_/  RAM: ${navigator.deviceMemory*1024} Mib</span>
        <span className="text-[2px]" style="color:#50fa7b">                         
      `;
      return ascii;
    },
    clear: () => setOutput([]),
    ls: async () => {
      const data = await ensureRepos();
      if (!data || data.length === 0) return "No repos found.";
      return data
        .map(
          (r) =>
            `${r.name} - ${r.description || "No description"} (★ ${r.stargazers_count})`
        )
        .join("\n");
    },

    repo: async (args) => {
      if (!args[0]) return `Usage: repo ${escapeHtml('<repo-name>')}`;
      const data = await ensureRepos();
      const r = data?.find(
        (x) => x.name.toLowerCase() === args[0].toLowerCase()
      );
      if (!r) return `Repo not found: ${args[0]}`;
      return `Name: ${r.name}\nDescription: ${r.description || "—"}\nStars: ${r.stargazers_count}\nHomepage: ${r.homepage ? `<a className="hover:cursor-pointer" href="${r.homepage}" target="_blank" rel="noopener noreferrer">${r.homepage}</a>` : "—"}\nURL: <a className="hover:cursor-pointer" href="${r.html_url}" target="_blank" rel="noopener noreferrer">${r.html_url}</a>\nLanguage: ${r.language || "—"}\nUpdated: ${new Date(r.updated_at).toLocaleString()}`;
    },

    readme: async (args) => {
      if (!args[0]) return `Usage: readme ${escapeHtml('<repo-name>')}\nTry readme ${githubUser}`;
      try {
        const url = `https://api.github.com/repos/${githubUser}/${args[0]}/readme`;
        const res = await apiFetch(url);
        if (!res) return `No README found for ${args[0]}`;

        const decodeBase64 = (base64) => {
          const binary = atob(base64.replace(/\n/g, ""));
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
          return new TextDecoder("utf-8").decode(bytes);
        };

        const content = decodeBase64(res.content);
        const html = marked(content);
        return html;
      } catch (e) {
        return `Failed to fetch README: ${e.message}`;
      }
    },
  };

  const runCommandLine = async (line) => {
    if (!line) return;
    append(
      `<span style="${rootAccess ? 'color:#ff7b7b' : 'color:#7be4ff'}">${rootAccess ? 'root' : 'guest'}@portfolio:~$</span> ${escapeHtml(line)}`
    );
    setHistory((prev) => [...prev, line]);
    setHistoryIdx(null);

    const parts = line.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!(cmd in commands)) {
      append(`Command not found: ${cmd}`);
      return;
    }
    const res = await commands[cmd](args);
    if (res) append(res);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const val = inputRef.current.value;
      inputRef.current.value = "";
      await runCommandLine(val);
    } else if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      setHistoryIdx((idx) => {
        const newIdx =
          idx === null ? history.length - 1 : Math.max(0, idx - 1);
        inputRef.current.value = history[newIdx];
        return newIdx;
      });
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (history.length === 0) return;
      setHistoryIdx((idx) => {
        if (idx === null) return null;
        const newIdx = Math.min(history.length - 1, idx + 1);
        inputRef.current.value = history[newIdx] || "";
        return newIdx;
      });
      e.preventDefault();
    }
    else if (e.key === 'c' && e.ctrlKey) {
      if (badappleid.current) {
        clearInterval(badappleid.current);
        badappleAudioRef.current.pause();
        badappleid.current = null;
        replace([]);
        append("Bad Apple stopped.");
      }
    }
  };

  useEffect(() => {
    append("Welcome to the terminal portfolio. Type 'help' to start.");
    append(`Current GitHub user: ${githubUser}`);
  }, []);

  return (
    <div
      className="wrap box boxanimation"
      style={{ padding: 16, fontFamily: "monospace", color: "#d8e6ff" }}
    >
      <div
        className="terminal h-full"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div className="header" style={{ color: "#9fb0d9" }}>
          Satvik's Terminal Portfolio — type 'help'
        </div>
        <div
          className="screen boxanimation"
          ref={screenRef}
          style={{
            minHeight: 400,
            maxHeight: "60vh",
            overflowY: "auto",
            borderRadius: 8,
          }}
          onClick={() => {
            const selection = window.getSelection();
            if (!selection || selection.toString() === "") {
              inputRef.current.focus();
            }
          }}
        >
          <div className="output">
            {output.map((line, i) => (
              <div
                className={`${badappleid.current ? 'text-[7.9px] md:text-[18px] lg:text-[10px]' : ''}`}
                key={i}
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>
          <div
            className={`prompt-line ${badappleid.current ? 'text-[7px]  md:text-[18px] lg:text-[10px]' : ''}`}
            style={{ display: "flex", marginTop: 8 }}
          >
            <div style={{ color: `${rootAccess ? '#ff7b7b' : '#7be4ff'}`, marginRight: 8 }}>
              {rootAccess ? 'root' : 'guest'}@portfolio:~$
            </div>
            <input
              ref={inputRef}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                background: "transparent",
                border: 0,
                outline: "none",
                color: "#d8e6ff",
              }}
              placeholder="type a command..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
