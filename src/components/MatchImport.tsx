import React, { useState } from 'react';
import { useDraftStore } from '@/stores/draft-store';
import { useCalculationStore } from '@/stores/calculation-store';
import { CM_STAGES } from '@/lib/cm-rules';
import { cn } from '@/lib/utils';

export function MatchImport() {
  const [matchId, setMatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedMatch, setImportedMatch] = useState<any>(null);
  const { importDraft, resetDraft } = useDraftStore();
  const calculate = useCalculationStore(state => state.calculate);

  const handleImport = async () => {
    if (!matchId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');
      setImportedMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = (from: number = 0) => {
    if (!importedMatch?.picks_bans) return;
    resetDraft();
    const history = importedMatch.picks_bans
      .filter((pb: any) => pb.order <= from || from === 0)
      .map((pb: any) => ({ stage: CM_STAGES[pb.order - 1], heroId: pb.hero_id }));
    importDraft(history);
    setImportedMatch(null);
    setTimeout(() => calculate(), 0);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold text-[#7a7568]/60 uppercase shrink-0">IMPORT</span>
      <input
        placeholder="Match ID"
        value={matchId}
        onChange={(e) => setMatchId(e.target.value)}
        type="number"
        className="w-20 h-6 px-2 rounded-[1px] text-[10px] bg-[#1e2028] border border-[#3d4250] text-[#d4cfbf] placeholder:text-[#7a7568]/40 focus:outline-none focus:border-[#c7a44e]/40"
      />
      <button
        onClick={handleImport}
        disabled={loading || !matchId}
        className="dota-btn text-[9px] px-2 py-0.5"
      >
        {loading ? '...' : 'FETCH'}
      </button>
      {error && <span className="text-[9px] text-[#e04040]">{error}</span>}
      {importedMatch && (
        <div className="flex items-center gap-1.5 animate-slide-in">
          <span className="text-[9px] text-[#7a7568]">#{importedMatch.match_id}</span>
          <button onClick={() => handleReplay(0)} className="dota-btn text-[9px] px-1.5 py-0.5">FULL</button>
          <button onClick={() => handleReplay(12)} className="dota-btn dota-btn-gold text-[9px] px-1.5 py-0.5">STAGE 13</button>
        </div>
      )}
    </div>
  );
}
