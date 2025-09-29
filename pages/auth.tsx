import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [userEmail,setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function signInEmail(){
    const { error } = await supabase.auth.signInWithPassword({email,password});
    if (error) alert(error.message);
    else location.href="/";
  }

  async function signUpEmail(){
    const { error } = await supabase.auth.signUp({email,password});
    if (error) alert(error.message);
    else alert("가입 완료! 이메일 확인해주세요.");
  }

  async function signInGoogle(){
    const { error } = await supabase.auth.signInWithOAuth({ provider:"google" });
    if (error) alert(error.message);
  }

  async function signOut(){
    await supabase.auth.signOut();
    location.reload();
  }

  return (
    <div style={{maxWidth:360,margin:"0 auto"}}>
      <h1>로그인 / 회원가입</h1>
      {userEmail ? (
        <>
          <p>현재 로그인: {userEmail}</p>
          <button onClick={signOut}>로그아웃</button>
        </>
      ) : (
        <div style={{display:"grid",gap:8}}>
          <input placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="비밀번호" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={signInEmail}>이메일 로그인</button>
          <button onClick={signUpEmail}>이메일 가입</button>
          <hr />
          <button onClick={signInGoogle}>구글 로그인</button>
        </div>
      )}
    </div>
  );
}
