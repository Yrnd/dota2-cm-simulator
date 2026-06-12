import { create } from 'zustand';
import { supabase, isOnline } from '@/lib/supabase';
import { CM_STAGES, DraftStage, TURN_TIME, getRandomAvailableHero } from '@/lib/cm-rules';
import { useHeroStore } from './hero-store';

export type Team = 'radiant' | 'dire';
export type LobbyStatus = 'waiting' | 'drafting' | 'completed';

export interface LobbyState {
  lobbyId: string | null;
  lobbyCode: string | null;
  status: LobbyStatus;
  currentStageIndex: number;
  timeRemaining: number;
  radiantPicks: number[];
  radiantBans: number[];
  direPicks: number[];
  direBans: number[];
  history: { stage: DraftStage; heroId: number }[];
  radiantPlayer: string | null;
  direPlayer: string | null;
  myTeam: Team | null;
  isMyTurn: boolean;
  lastActionBy: string | null;
  createdAt: string | null;

  createLobby: (playerName: string) => Promise<string>;
  joinLobby: (code: string, playerName: string) => Promise<boolean>;
  leaveLobby: () => void;
  performAction: (heroId: number) => void;
  passTime: () => void;
  subscribeToLobby: () => void;
  unsubscribeFromLobby: () => void;
  endDraft: () => Promise<void>;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

let channel: any = null;

export const useLobbyStore = create<LobbyState>((set, get) => ({
  lobbyId: null,
  lobbyCode: null,
  status: 'waiting',
  currentStageIndex: 0,
  timeRemaining: TURN_TIME,
  radiantPicks: [],
  radiantBans: [],
  direPicks: [],
  direBans: [],
  history: [],
  radiantPlayer: null,
  direPlayer: null,
  myTeam: null,
  isMyTurn: false,
  lastActionBy: null,
  createdAt: null,

  createLobby: async (playerName: string) => {
    if (!isOnline()) {
      const code = generateCode();
      const id = crypto.randomUUID();
      set({
        lobbyId: id, lobbyCode: code, status: 'waiting',
        myTeam: 'radiant', radiantPlayer: playerName, isMyTurn: false,
        createdAt: new Date().toISOString(),
      });
      return code;
    }

    const code = generateCode();
    const playerId = generatePlayerId();
    const { data, error } = await supabase!.from('lobbies').insert({
      code,
      status: 'waiting',
      current_stage: 0,
      time_remaining: TURN_TIME,
      radiant_picks: [],
      radiant_bans: [],
      dire_picks: [],
      dire_bans: [],
      history: [],
      radiant_player: playerName,
      radiant_player_id: playerId,
      dire_player: null,
      dire_player_id: null,
      last_action_by: null,
    }).select().single();

    if (error || !data) throw error;

    set({
      lobbyId: data.id, lobbyCode: code, status: 'waiting',
      myTeam: 'radiant', radiantPlayer: playerName, isMyTurn: false,
      createdAt: data.created_at,
    });

    get().subscribeToLobby();
    return code;
  },

  joinLobby: async (code: string, playerName: string) => {
    if (!isOnline()) return false;

    const { data: lobbies } = await supabase!.from('lobbies')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (!lobbies) return false;

    const playerId = generatePlayerId();
    await supabase!.from('lobbies').update({
      dire_player: playerName,
      dire_player_id: playerId,
      status: 'drafting',
    }).eq('id', lobbies.id);

    set({
      lobbyId: lobbies.id, lobbyCode: code.toUpperCase(), status: 'drafting',
      myTeam: 'dire', direPlayer: playerName,
      currentStageIndex: lobbies.current_stage,
      timeRemaining: lobbies.time_remaining,
      radiantPicks: lobbies.radiant_picks || [],
      radiantBans: lobbies.radiant_bans || [],
      direPicks: lobbies.dire_picks || [],
      direBans: lobbies.dire_bans || [],
      history: lobbies.history || [],
      radiantPlayer: lobbies.radiant_player,
      createdAt: lobbies.created_at,
    });

    get().subscribeToLobby();
    return true;
  },

  leaveLobby: () => {
    get().unsubscribeFromLobby();
    set({
      lobbyId: null, lobbyCode: null, status: 'waiting',
      currentStageIndex: 0, timeRemaining: TURN_TIME,
      radiantPicks: [], radiantBans: [], direPicks: [], direBans: [],
      history: [], radiantPlayer: null, direPlayer: null,
      myTeam: null, isMyTurn: false, lastActionBy: null, createdAt: null,
    });
  },

  performAction: async (heroId: number) => {
    const state = get();
    if (state.currentStageIndex >= 24) return;
    if (!state.isMyTurn) return;

    const stage = CM_STAGES[state.currentStageIndex];
    const playerId = state.myTeam === 'radiant' ? state.radiantPlayer : state.direPlayer;

    const newRadiantPicks = [...state.radiantPicks];
    const newRadiantBans = [...state.radiantBans];
    const newDirePicks = [...state.direPicks];
    const newDireBans = [...state.direBans];
    const newHistory = [...state.history, { stage, heroId }];
    const newIndex = state.currentStageIndex + 1;

    if (stage.type === 'ban') {
      if (stage.team === 'radiant') newRadiantBans.push(heroId);
      else newDireBans.push(heroId);
    } else {
      if (stage.team === 'radiant') newRadiantPicks.push(heroId);
      else newDirePicks.push(heroId);
    }

    const isComplete = newIndex >= 24;

    set({
      currentStageIndex: newIndex,
      radiantPicks: newRadiantPicks,
      radiantBans: newRadiantBans,
      direPicks: newDirePicks,
      direBans: newDireBans,
      history: newHistory,
      timeRemaining: TURN_TIME,
      isMyTurn: false,
      lastActionBy: playerId,
      status: isComplete ? 'completed' : state.status,
    });

    if (isOnline() && state.lobbyId) {
      await supabase!.from('lobbies').update({
        current_stage: newIndex,
        radiant_picks: newRadiantPicks,
        radiant_bans: newRadiantBans,
        dire_picks: newDirePicks,
        dire_bans: newDireBans,
        history: newHistory,
        time_remaining: TURN_TIME,
        last_action_by: playerId,
        status: isComplete ? 'completed' : 'drafting',
      }).eq('id', state.lobbyId);
    }
  },

  passTime: async () => {
    const state = get();
    if (state.status !== 'drafting') return;

    const newTime = state.timeRemaining - 1;
    if (newTime <= 0) {
      const available = useHeroStore.getState().heroes
        .filter(h => !state.radiantPicks.includes(h.id) && !state.radiantBans.includes(h.id) &&
          !state.direPicks.includes(h.id) && !state.direBans.includes(h.id))
        .map(h => h.id);
      if (available.length > 0) {
        get().performAction(getRandomAvailableHero(available));
      }
    } else {
      set({ timeRemaining: newTime });
      if (isOnline() && state.lobbyId) {
        await supabase!.from('lobbies').update({ time_remaining: newTime }).eq('id', state.lobbyId);
      }
    }
  },

  subscribeToLobby: () => {
    if (!isOnline() || !get().lobbyId) return;
    const lobbyId = get().lobbyId;

    channel = supabase!.channel(`lobby:${lobbyId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'lobbies',
        filter: `id=eq.${lobbyId}`,
      }, (payload) => {
        const d = payload.new as any;
        const myTeam = get().myTeam;
        set({
          status: d.status,
          currentStageIndex: d.current_stage,
          timeRemaining: d.time_remaining,
          radiantPicks: d.radiant_picks || [],
          radiantBans: d.radiant_bans || [],
          direPicks: d.dire_picks || [],
          direBans: d.dire_bans || [],
          history: d.history || [],
          radiantPlayer: d.radiant_player,
          direPlayer: d.dire_player,
          lastActionBy: d.last_action_by,
        });

        const currentStage = CM_STAGES[d.current_stage];
        if (currentStage && d.status === 'drafting') {
          set({ isMyTurn: currentStage.team === myTeam });
        }
      })
      .subscribe();
  },

  unsubscribeFromLobby: () => {
    if (channel) {
      supabase?.removeChannel(channel);
      channel = null;
    }
  },

  endDraft: async () => {
    const state = get();
    if (isOnline() && state.lobbyId) {
      await supabase!.from('lobbies').update({ status: 'completed' }).eq('id', state.lobbyId);
    }
    set({ status: 'completed' });
  },
}));
