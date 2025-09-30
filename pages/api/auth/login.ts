// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../lib/serverSupabase'; // <-- api/auth 기준으로 두 단계 올라간 경로 (pages/api/auth -> ../../lib)

type ApiRes =
  | { ok: true; token: string; user: { id: string; email: string; role?: string } }
  | { ok: false; msg: string; detail?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiRes>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, msg: 'Method Not Allowed' });
  }

  try {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: '이메일/비밀번호를 입력해주세요.' });
    }

    // users 테이블에서 사용자 조회
    const { data: rows, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password, provider, role')
      .eq('email', email)
      .limit(1);

    if (error) {
      return res.status(500).json({ ok: false, msg: 'DB 오류', detail: error.message });
    }
    const user = rows?.[0];
    if (!user) {
      return res.status(401).json({ ok: false, msg: '가입된 이메일이 없습니다.' });
    }
    if (user.provider && user.provider !== 'local') {
      return res.status(400).json({ ok: false, msg: '소셜 계정으로 가입된 이메일입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ ok: false, msg: '비밀번호가 올바르지 않습니다.' });
    }

    // 최소 토큰 (MVP: user.id 그대로 저장 — 추후 JWT로 교체 가능)
    const token = user.id;

    return res.status(200).json({
      ok: true,
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, msg: '서버 오류', detail: e?.message });
  }
}
