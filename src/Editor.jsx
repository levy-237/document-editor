import React, { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";

import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
const SAVE_INTERVAL_MS = 2000;
export default function Editor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  useEffect(() => {
    const sock = io("http://localhost:3000");
    setSocket(sock);
    return () => {
      sock.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.on("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
    });
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const timer = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handleQuillUpdate = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handleQuillUpdate);
    return () => {
      socket.off("receive-changes", handleQuillUpdate);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handleQuill = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handleQuill);
    return () => {
      quill.off("text-change", handleQuill);
    };
  }, [socket, quill]);
  const quillWrapper = useCallback((quillWrapper) => {
    if (quillWrapper === null) return;
    quillWrapper.innerHTML = "";
    const textEditor = document.createElement("div");
    quillWrapper.append(textEditor);
    const qui = new Quill(textEditor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_STYLE },
    });
    qui.disable();
    qui.setText("Loading...");
    setQuill(qui);
  }, []);
  return (
    <div
      id="quill-container"
      ref={quillWrapper}
      className="editor-container"
    ></div>
  );
}
const TOOLBAR_STYLE = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  ["link", "image", "video"],
  ["blockquote", "code-block"],
  ["clean"],
];
