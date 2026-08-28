import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [userRes, fileRes] = await Promise.all([
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/files`),
    ]);
    setUsers(await userRes.json());
    setFiles(await fileRes.json());
  };

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "회원 생성 실패");
      return;
    }
    setName("");
    setEmail("");
    setMessage("회원을 추가했습니다.");
    await load();
  };

  const uploadFile = async (event) => {
    event.preventDefault();
    const file = event.target.image.files[0];
    if (!file) {
      setMessage("파일을 선택하세요.");
      return;
    }
    const body = new FormData();
    body.append("image", file);
    const res = await fetch(`${API_URL}/files`, {
      method: "POST",
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "업로드 실패");
      return;
    }
    setMessage("파일을 올렸습니다.");
    event.target.reset();
    await load();
  };

  return (
    <main>
      <h1>블로그 실습</h1>
      <p className="api">API: {API_URL}</p>
      {message ? <p className="msg">{message}</p> : null}

      <section>
        <h2>회원</h2>
        <form onSubmit={createUser}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <button type="submit">추가</button>
        </form>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>파일</h2>
        <form onSubmit={uploadFile}>
          <input type="file" name="image" accept="image/*" />
          <button type="submit">업로드</button>
        </form>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <a href={`${API_URL}${file.url}`} target="_blank" rel="noreferrer">
                {file.originalName}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
