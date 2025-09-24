"use client";
import React, { useState, useEffect, useRef } from "react";

export default function TerminalPortfolio() {
  const [output, setOutput] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(null);
  const [repos, setRepos] = useState(null);
  const [githubUser, setGithubUser] = useState("satvikprsd");
  const [token] = useState(null);
  const inputRef = useRef(null);
  const screenRef = useRef(null);

  const append = (text) => {
    setOutput((prev) => [...prev, text]);
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
      `Available commands:\n\nhelp, about, ls, repo <name>, readme <name>, contact, clear`,
    about: () => `Hi — I'm Satvik Prasad. This is my implementation of a terminal style portfolio.`,
    contact: () => `Email: satvikprsd@gmail.com\nGitHub: https://github.com/${githubUser}`,
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
      if (!args[0]) return "Usage: repo <name>";
      const data = await ensureRepos();
      const r = data?.find(
        (x) => x.name.toLowerCase() === args[0].toLowerCase()
      );
      if (!r) return `Repo not found: ${args[0]}`;
      return `Name: ${r.name}\nDescription: ${r.description || "—"}\nStars: ${r.stargazers_count}\nHomepage: ${r.homepage ? `<a href="${r.homepage}" target="_blank" rel="noopener noreferrer">${r.homepage}</a>` : "—"}\nURL: <a href="${r.html_url}" target="_blank" rel="noopener noreferrer">${r.html_url}</a>\nLanguage: ${r.language || "—"}\nUpdated: ${new Date(r.updated_at).toLocaleString()}`;
    },

    readme: async (args) => {
      if (!args[0]) return "Usage: readme <repo>";
      try {
        const url = `https://api.github.com/repos/${githubUser}/${args[0]}/readme`;
        const res = await apiFetch(url);
        if (!res) return `No README found for ${args[0]}`;
        const content = atob(res.content.replace(/\n/g, ""));
        return `README (${args[0]})\n${content}`;
      } catch (e) {
        return `Failed to fetch README: ${e.message}`;
      }
    },
  };

  const runCommandLine = async (line) => {
    if (!line) return;
    append(
      `<span style="color:#7be4ff">guest@portfolio:~$</span> ${escapeHtml(line)}`
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
          onClick={() => inputRef.current.focus()}
        >
          <div className="output">
            {output.map((line, i) => (
              <div
                key={i}
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>
          <div
            className="prompt-line"
            style={{ display: "flex", marginTop: 8 }}
          >
            <div style={{ color: "#7be4ff", marginRight: 8 }}>
              guest@portfolio:~$
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
