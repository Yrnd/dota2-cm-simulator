import React, { useState } from 'react';
import { useLobbyStore } from '@/stores/lobby-store';
import { isOnline, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface LobbyMenuProps {
  onBack: () => void;
}

export function LobbyMenu({ onBack }: LobbyMenuProps) {
  const { createLobby, joinLobby } = useLobbyStore();
  const [tab, setTab] = useState<'create' | 'join' | 'history'>('create');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const code = await createLobby(playerName.trim());
      setCreatedCode(code);
      setWaiting(true);
    } catch (e: any) {
      setError(e.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ok = await joinLobby(joinCode.trim().toUpperCase(), playerName.trim());
      if (!ok) setError('Lobby not found or already started');
    } catch (e: any) {
      setError(e.message || 'Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (createdCode) navigator.clipboard.writeText(createdCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Back button */}
        <button onClick={onBack} className="dota-btn text-[10px] px-3 py-1 mb-4">
          ← BACK
        </button>

        {/* Title */}
        <div className="dota-panel rounded-sm p-4 mb-4">
          <h2 className="text-lg font-bold text-glow-gold text-center" style={{ color: '#c7a44e' }}>
            ONLINE DRAFT
          </h2>
          <p className="text-[11px] text-[#7a7568] text-center mt-1">
            Create or join a lobby to draft with a friend
          </p>
        </div>

        {/* Online status */}
        <div className={cn(
          'text-[10px] text-center mb-3 px-2 py-1 rounded-sm',
          isOnline() ? 'bg-[#1a3a1a] text-[#5fcc5f]' : 'bg-[#3a1a1a] text-[#e04040]',
        )}>
          {isOnline() ? '● Online — Real-time sync enabled' : '● Offline — Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY'}
        </div>

        {/* Tabs */}
        {!waiting && (
          <div className="flex mb-3">
            {(['create', 'join', 'history'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn('dota-filter flex-1', tab === t && 'active')}
              >
                {t === 'create' ? 'CREATE' : t === 'join' ? 'JOIN' : 'HISTORY'}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#3a1a1a] border border-[#5a2a2a] text-[#e04040] text-[11px] p-2 rounded-sm mb-3">
            {error}
          </div>
        )}

        {/* Create tab */}
        {tab === 'create' && !waiting && (
          <div className="dota-panel rounded-sm p-4 space-y-3">
            <div>
              <label className="text-[10px] text-[#7a7568] uppercase tracking-wider mb-1 block">Your Name</label>
              <input
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full h-8 px-3 text-sm bg-[#1e2028] border border-[#3d4250] text-[#d4cfbf] rounded-sm focus:outline-none focus:border-[#c7a44e]/50"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!playerName.trim() || loading}
              className="dota-btn dota-btn-gold w-full py-2"
            >
              {loading ? 'CREATING...' : 'CREATE LOBBY'}
            </button>
          </div>
        )}

        {/* Waiting screen */}
        {waiting && createdCode && (
          <div className="dota-panel dota-panel-gold rounded-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-b from-[#4a3a1a] to-[#2a1a0a] border-2 border-[#c7a44e] flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-[#c7a44e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-[#7a7568] mb-2">Share this code with your opponent:</p>
              <div
                onClick={copyCode}
                className="text-3xl font-bold tracking-[0.3em] cursor-pointer select-all text-glow-gold"
                style={{ color: '#c7a44e', fontFamily: "'Georgia', serif" }}
                title="Click to copy"
              >
                {createdCode}
              </div>
              <p className="text-[9px] text-[#7a7568]/50 mt-1">Click to copy</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7a7568]">
              <div className="w-4 h-4 border-2 border-[#c7a44e] border-t-transparent rounded-full animate-spin" />
              Waiting for opponent...
            </div>
            <button onClick={() => { setWaiting(false); setCreatedCode(null); useLobbyStore.getState().leaveLobby(); }} className="dota-btn text-[10px] px-3 py-1">
              CANCEL
            </button>
          </div>
        )}

        {/* Join tab */}
        {tab === 'join' && !waiting && (
          <div className="dota-panel rounded-sm p-4 space-y-3">
            <div>
              <label className="text-[10px] text-[#7a7568] uppercase tracking-wider mb-1 block">Your Name</label>
              <input
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full h-8 px-3 text-sm bg-[#1e2028] border border-[#3d4250] text-[#d4cfbf] rounded-sm focus:outline-none focus:border-[#c7a44e]/50"
                maxLength={20}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#7a7568] uppercase tracking-wider mb-1 block">Lobby Code</label>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                className="w-full h-8 px-3 text-sm bg-[#1e2028] border border-[#3d4250] text-[#c7a44e] rounded-sm focus:outline-none focus:border-[#c7a44e]/50 tracking-[0.2em] text-center uppercase"
                maxLength={6}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={!playerName.trim() || !joinCode.trim() || loading}
              className="dota-btn dota-btn-gold w-full py-2"
            >
              {loading ? 'JOINING...' : 'JOIN LOBBY'}
            </button>
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && !waiting && (
          <DraftHistory />
        )}
      </div>
    </div>
  );
}

function DraftHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadHistory = async () => {
      if (!isOnline()) {
        const saved = localStorage.getItem('draft_history');
        setHistory(saved ? JSON.parse(saved) : []);
        setLoading(false);
        return;
      }
      const { data } = await supabase!.from('lobbies')
        .select('id, code, radiant_player, dire_player, radiant_picks, dire_picks, radiant_bans, dire_bans, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);
      setHistory(data || []);
      setLoading(false);
    };
    loadHistory();
  }, []);

  if (loading) return (
    <div className="dota-panel rounded-sm p-8 text-center">
      <div className="w-6 h-6 border-2 border-[#c7a44e] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (history.length === 0) return (
    <div className="dota-panel rounded-sm p-8 text-center">
      <p className="text-[11px] text-[#7a7568]">No draft history yet</p>
    </div>
  );

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
      {history.map((h) => (
        <div key={h.id} className="dota-panel rounded-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#c7a44e]">#{h.code}</span>
            <span className="text-[9px] text-[#7a7568]">
              {new Date(h.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#5fcc5f]">{h.radiant_player || 'Radiant'}</span>
            <span className="text-[#7a7568]">vs</span>
            <span className="text-[#e04040]">{h.dire_player || 'Dire'}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[8px] text-[#7a7568]/50">Picks:</span>
            <span className="text-[9px] text-[#5fcc5f]">{(h.radiant_picks || []).length}</span>
            <span className="text-[9px] text-[#7a7568]">/</span>
            <span className="text-[9px] text-[#e04040]">{(h.dire_picks || []).length}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
