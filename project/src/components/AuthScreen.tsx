import { useState } from 'react';
import {
  Eye, EyeOff, LogIn, UserPlus, Loader2, AlertTriangle, Home, ArrowLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────────
type AuthMode = 'login' | 'register' | 'forgot';

export interface AuthScreenProps {
  onAuthenticated: (userId: string, displayName: string) => void;
}

// ─── Google "G" SVG logo ─────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ─── Divider ────────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-white/30 text-[11px] font-medium tracking-wider uppercase">o</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────
export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode]           = useState<AuthMode>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [info, setInfo]           = useState<string | null>(null);

  const reset = () => { setError(null); setInfo(null); };

  // ── Resolve display name after auth ─────────────────────────────────────────
  // Tries to find the matching household_member by auth_uid; falls back to
  // full_name metadata or email prefix.
  const resolveAndEnter = async (userId: string, metaName?: string) => {
    try {
      const { data } = await supabase
        .from('household_member')
        .select('id, name')
        .eq('auth_uid', userId)
        .maybeSingle();

      const displayName = data?.name ?? metaName ?? userId.split('@')[0];
      const resolvedId  = data?.id   ?? userId;
      onAuthenticated(resolvedId, displayName);
    } catch {
      // If the query fails (e.g. table not yet migrated) fall back gracefully
      onAuthenticated(userId, metaName ?? 'Usuario');
    }
  };

  // ── Email / Password submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    if (mode !== 'forgot' && !password)  { setError('Ingresa tu contraseña.'); return; }
    if (mode === 'register' && !fullName.trim()) { setError('Ingresa tu nombre completo.'); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        const user = data.user!;
        await resolveAndEnter(user.id, user.user_metadata?.full_name);

      } else if (mode === 'register') {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (err) throw err;
        // Supabase may require email confirmation
        if (data.session) {
          await resolveAndEnter(data.user!.id, fullName.trim());
        } else {
          setInfo('Revisa tu correo para confirmar tu cuenta y luego inicia sesión.');
          setMode('login');
        }

      } else if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: window.location.origin }
        );
        if (err) throw err;
        setInfo('Te enviamos un enlace para restablecer tu contraseña.');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido.';
      // Friendlier Spanish messages for common Supabase errors
      if (msg.includes('Invalid login credentials'))
        setError('Correo o contraseña incorrectos.');
      else if (msg.includes('Email not confirmed'))
        setError('Confirma tu correo antes de iniciar sesión.');
      else if (msg.includes('User already registered'))
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    reset();
    setGoogleLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (err) throw err;
      // Browser will redirect; no further action needed here.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar con Google.');
      setGoogleLoading(false);
    }
  };

  // ── Derived UI state ─────────────────────────────────────────────────────────
  const isForgot    = mode === 'forgot';
  const isRegister  = mode === 'register';

  const title = isForgot
    ? 'Recuperar contraseña'
    : isRegister
    ? 'Crear cuenta'
    : 'Bienvenido de vuelta';

  const subtitle = isForgot
    ? 'Te enviaremos un enlace a tu correo.'
    : isRegister
    ? 'Únete al hogar HappyCleaning.'
    : 'Inicia sesión en tu hogar.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-violet-700/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[380px]">

        {/* ── Brand ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-tight">HappyCleaning</h1>
            <p className="text-white/40 text-[13px] mt-0.5">Gestión del hogar familiar</p>
          </div>
        </div>

        {/* ── Card ──────────────────────────────────────────────────────────── */}
        <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-7 shadow-2xl">

          {/* Back button (forgot mode) */}
          {isForgot && (
            <button
              type="button"
              onClick={() => { setMode('login'); reset(); }}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al inicio de sesión
            </button>
          )}

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>
          </div>

          {/* ── Google OAuth (only on login / register) ──────────────────── */}
          {!isForgot && (
            <>
              <button
                id="btn-google-auth"
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="
                  w-full flex items-center justify-center gap-3
                  bg-white hover:bg-gray-50 active:bg-gray-100
                  text-gray-700 font-semibold text-sm
                  py-2.5 rounded-xl
                  shadow-sm
                  transition-all duration-150 active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {googleLoading
                  ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  : <GoogleIcon />
                }
                Continuar con Google
              </button>
              <OrDivider />
            </>
          )}

          {/* ── Form ────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full name (register only) */}
            {isRegister && (
              <div>
                <label htmlFor="auth-fullname" className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                  Nombre completo
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Kevin García"
                  autoComplete="name"
                  className="
                    w-full bg-white/[0.06] border border-white/10
                    rounded-xl px-4 py-3 text-white text-sm
                    placeholder:text-white/20
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                    transition-all duration-150
                  "
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="auth-email" className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                className="
                  w-full bg-white/[0.06] border border-white/10
                  rounded-xl px-4 py-3 text-white text-sm
                  placeholder:text-white/20
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                  transition-all duration-150
                "
              />
            </div>

            {/* Password (not shown on forgot) */}
            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); reset(); }}
                      className="text-[11px] text-indigo-400/80 hover:text-indigo-300 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    className="
                      w-full bg-white/[0.06] border border-white/10
                      rounded-xl px-4 py-3 pr-11 text-white text-sm
                      placeholder:text-white/20
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                      transition-all duration-150
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Info message */}
            {info && (
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                <span className="text-emerald-400 text-lg leading-none mt-0.5">✓</span>
                <p className="text-emerald-300 text-xs leading-relaxed">{info}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-gradient-to-r from-indigo-600 to-violet-600
                hover:from-indigo-500 hover:to-violet-500
                active:scale-[0.98]
                text-white font-semibold text-sm
                shadow-lg shadow-indigo-600/25
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
              ) : isForgot ? (
                'Enviar enlace de recuperación'
              ) : mode === 'login' ? (
                <><LogIn className="w-4 h-4" /> Iniciar sesión</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Crear cuenta</>
              )}
            </button>
          </form>
        </div>

        {/* ── Toggle login / register ──────────────────────────────────────── */}
        {!isForgot && (
          <p className="text-center text-white/35 text-sm mt-5">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              id={mode === 'login' ? 'link-go-register' : 'link-go-login'}
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); reset(); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        )}

        <p className="text-center text-white/15 text-[10px] mt-6 tracking-widest uppercase">
          Hogar · Amor · Orden
        </p>
      </div>
    </div>
  );
}
