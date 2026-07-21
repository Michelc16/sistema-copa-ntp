"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarRange, Database, ExternalLink, LogOut, Plus, Save, Settings2, TableProperties, Trash2, UsersRound } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { formatDate, phaseLabels } from "@/lib/format";
import type { Match, Player, Team, TournamentRules, TournamentView } from "@/lib/types";

type Tab = "geral" | "equipes" | "jogos" | "pontuacao" | "regras";

async function requestJson(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, { ...options, headers: { "content-type": "application/json", ...options.headers } });
    const result = await response.json().catch(() => ({ error: "Resposta do servidor inválida." }));
    
    if (!response.ok) {
      const errorMsg = result.error ?? `Erro HTTP ${response.status}`;
      console.error(`[Request Error] ${response.status}: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    if (result.error) {
      console.error(`[API Error Response]:`, result.error);
      throw new Error(result.error);
    }
    
    if (!result.ok && typeof result.ok !== "undefined") {
      throw new Error("Operação não completada pelo servidor.");
    }
    
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro de conexão com servidor";
    console.error(`[RequestJSON Error]:`, message);
    throw error;
  }
}

function localDateTime(iso: string) {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone:"America/Sao_Paulo", year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false }).formatToParts(new Date(iso));
  const get=(type:string)=>parts.find((part)=>part.type===type)?.value??"";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function toIsoWithBrazilOffset(value: string) { return `${value}:00-03:00`; }

export function AdminDashboard({ initialData, email }: { initialData: TournamentView; email: string }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("geral");
  const [selectedTeamId, setSelectedTeamId] = useState(initialData.teams[0]?.id ?? "");
  const [toast, setToast] = useState<{ text:string; error?:boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!toast) return; const timer=setTimeout(()=>setToast(null),3200); return()=>clearTimeout(timer); }, [toast]);
  const selectedTeam = data.teams.find((team) => team.id === selectedTeamId) ?? data.teams[0];

  function notify(text: string, error=false) { setToast({text,error}); }
  async function save(action:()=>Promise<unknown>, message="Alterações salvas.") { 
    setBusy(true); 
    try { 
      await action(); 
      notify(message);
      router.refresh(); 
    } catch(error){ 
      const errorMsg = error instanceof Error ? error.message : "Falha ao salvar.";
      notify(errorMsg, true);
      console.error("Erro ao salvar:", error);
    } finally{
      setBusy(false);
    } 
  }
  async function logout(){ 
    try {
      await fetch("/api/auth/logout", { method: "POST" }); 
    } catch(e) {
      console.error("Erro ao fazer logout:", e);
    }
    router.push("/admin/login"); 
    router.refresh(); 
  }

  function updateTeamLocal(teamId:string, patch:Partial<Team>){ setData((current)=>({...current,teams:current.teams.map((team)=>team.id===teamId?{...team,...patch}:team)})); }
  function updatePlayerLocal(teamId:string, playerId:string, patch:Partial<Player>){ setData((current)=>({...current,teams:current.teams.map((team)=>team.id===teamId?{...team,players:team.players.map((player)=>player.id===playerId?{...player,...patch}:player)}:team)})); }
  function updateMatchLocal(matchId:string, patch:Partial<Match>){ setData((current)=>({...current,matches:current.matches.map((match)=>match.id===matchId?{...match,...patch}:match)})); }

  return <div className="admin-shell">
    <header className="admin-topbar"><Link href="/" className="brand-link"><BrandMark compact /></Link><span>Conectado como {email}</span><Link href="/" className="button button-ghost button-small"><ExternalLink size={15}/> Ver site</Link><button className="button button-danger button-small" onClick={logout}><LogOut size={15}/> Sair</button></header>
    <main className="admin-main">
      <div className="admin-heading"><div><span className="eyebrow">Central da organização</span><h1>Painel do campeonato</h1><p>Gerencie todas as informações públicas da 4ª Copa NTP.</p></div><span className="status-pill status-finished">Acesso protegido</span></div>
      {data.usingDemoData && <div className="admin-demo-warning"><AlertTriangle size={18}/><span>O banco ainda não está configurado ou está indisponível. O site mostra os dados iniciais, mas as alterações não serão salvas. <Link href="/configurar"><u>Configurar Neon</u></Link></span></div>}
      <nav className="admin-tabs">{([ ["geral","Informações",Settings2], ["equipes","Equipes e atletas",UsersRound], ["jogos","Jogos e placares",CalendarRange], ["pontuacao","Ajustes de pontos",TableProperties], ["regras","Regulamento",Database] ] as const).map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={15}/> {label}</button>)}</nav>

      {tab==="geral" && <TournamentPanel data={data} busy={busy} save={save} />}
      {tab==="equipes" && selectedTeam && <section className="admin-teams-layout"><aside className="admin-team-list">{data.teams.map((team)=><button key={team.id} className={selectedTeam.id===team.id?"active":""} onClick={()=>setSelectedTeamId(team.id)}><i style={{background:team.color}}/><span><b>{team.name}</b><small>{team.code} • Grupo {team.groupName}</small></span></button>)}</aside><TeamPanel team={selectedTeam} busy={busy} save={save} updateTeam={updateTeamLocal} updatePlayer={updatePlayerLocal} /></section>}
      {tab==="jogos" && <MatchesPanel matches={data.matches} teams={data.teams} busy={busy} save={save} updateMatch={updateMatchLocal} />}
      {tab==="pontuacao" && <AdjustmentsPanel data={data} busy={busy} save={save} />}
      {tab==="regras" && <RulesPanel rules={data.tournament.rules} busy={busy} save={save} />}
    </main>{toast&&<div className={`toast ${toast.error?"error":""}`}>{toast.text}</div>}
  </div>;
}

function TournamentPanel({data,busy,save}:{data:TournamentView;busy:boolean;save:(action:()=>Promise<unknown>,message?:string)=>Promise<void>}){
  async function submit(event:FormEvent<HTMLFormElement>){ event.preventDefault(); const f=new FormData(event.currentTarget); await save(()=>requestJson("/api/admin/tournament",{method:"PATCH",body:JSON.stringify({name:f.get("name"),edition:f.get("edition"),subtitle:f.get("subtitle"),description:f.get("description"),venue:f.get("venue"),city:f.get("city"),startDate:f.get("startDate"),endDate:f.get("endDate"),announcement:f.get("announcement")})})); }
  const t=data.tournament;
  return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Informações gerais</h2><p>Textos, datas e local exibidos na página inicial.</p></div></div><form className="form-grid" onSubmit={submit}><Field label="Nome"><input name="name" defaultValue={t.name} required/></Field><Field label="Edição"><input name="edition" defaultValue={t.edition} required/></Field><Field label="Chamada"><input name="subtitle" defaultValue={t.subtitle}/></Field><Field label="Cidade"><input name="city" defaultValue={t.city}/></Field><Field label="Local"><input name="venue" defaultValue={t.venue}/></Field><Field label="Data de início"><input name="startDate" type="date" defaultValue={t.startDate} required/></Field><Field label="Data de encerramento"><input name="endDate" type="date" defaultValue={t.endDate} required/></Field><Field label="Comunicado"><input name="announcement" defaultValue={t.announcement}/></Field><Field label="Descrição" className="full"><textarea name="description" defaultValue={t.description}/></Field><div className="form-actions"><button className="button button-primary" disabled={busy}><Save size={16}/> Salvar informações</button></div></form></section>;
}

function Field({label,className="",children}:{label:string;className?:string;children:React.ReactNode}){return <div className={`form-field ${className}`}><label>{label}</label>{children}</div>}

function TeamPanel({team,busy,save,updateTeam,updatePlayer}:{team:Team;busy:boolean;save:(action:()=>Promise<unknown>,message?:string)=>Promise<void>;updateTeam:(id:string,p:Partial<Team>)=>void;updatePlayer:(tid:string,pid:string,p:Partial<Player>)=>void}){
  const [newName,setNewName]=useState("");
  function changePlayerRole(player:Player,isCaptain:boolean){
    if(isCaptain){
      for(const teammate of team.players){
        updatePlayer(team.id,teammate.id,{isCaptain:teammate.id===player.id});
      }
      updateTeam(team.id,{captain:player.name});
      return;
    }
    updatePlayer(team.id,player.id,{isCaptain:false});
    if(team.captain===player.name) updateTeam(team.id,{captain:""});
  }
  async function saveTeam(){await save(()=>requestJson(`/api/admin/teams/${team.id}`,{method:"PATCH",body:JSON.stringify({name:team.name,groupName:team.groupName,color:team.color,captain:team.captain,active:team.active})}),"Equipe atualizada.");}
  async function addPlayer(){if(newName.trim().length<2)return;await save(()=>requestJson("/api/admin/players",{method:"POST",body:JSON.stringify({teamId:team.id,name:newName,shirtNumber:null,isCaptain:false})}),"Atleta adicionado.");setNewName("");}
  async function savePlayer(player:Player){await save(()=>requestJson(`/api/admin/players/${player.id}`,{method:"PATCH",body:JSON.stringify({name:player.name,shirtNumber:player.shirtNumber,isCaptain:player.isCaptain,active:player.active})}),"Atleta atualizado.");}
  async function deletePlayer(player:Player){if(!confirm(`Remover ${player.name} do elenco?`))return;await save(()=>requestJson(`/api/admin/players/${player.id}`,{method:"DELETE"}),"Atleta removido.");}
  return <section className="admin-panel"><div className="admin-panel-head"><div><h2>{team.code} • {team.name}</h2><p>Edite a equipe e os atletas cadastrados.</p></div><button className="button button-primary button-small" disabled={busy} onClick={saveTeam}><Save size={15}/> Salvar equipe</button></div><div className="form-grid"><Field label="Nome da equipe"><input value={team.name} onChange={(e)=>updateTeam(team.id,{name:e.target.value})}/></Field><Field label="Grupo"><select value={team.groupName} onChange={(e)=>updateTeam(team.id,{groupName:e.target.value as "A"|"B"})}><option>A</option><option>B</option></select></Field><Field label="Cor"><input type="color" value={team.color} onChange={(e)=>updateTeam(team.id,{color:e.target.value})}/></Field><Field label="Capitão / representante"><input value={team.captain} onChange={(e)=>updateTeam(team.id,{captain:e.target.value})}/></Field></div><div className="player-admin-list"><div className="admin-panel-head"><div><h2>Elenco</h2><p>{team.players.length} atletas cadastrados. Ao escolher um novo capitão, o anterior volta a ser atleta automaticamente.</p></div></div>{team.players.map((player)=><div className="player-row" key={player.id}><input aria-label="Nome" value={player.name} onChange={(e)=>updatePlayer(team.id,player.id,{name:e.target.value})}/><input aria-label="Camisa" type="number" min="0" max="99" placeholder="Nº" value={player.shirtNumber??""} onChange={(e)=>updatePlayer(team.id,player.id,{shirtNumber:e.target.value===""?null:Number(e.target.value)})}/><select aria-label="Função" value={player.isCaptain?"captain":"player"} onChange={(e)=>changePlayerRole(player,e.target.value==="captain")}><option value="player">Atleta</option><option value="captain">Capitão</option></select><span className="row-actions"><button className="icon-button save-icon" aria-label="Salvar atleta" onClick={()=>savePlayer(player)} disabled={busy}><Save size={15}/></button><button className="icon-button" aria-label="Remover atleta" onClick={()=>deletePlayer(player)} disabled={busy}><Trash2 size={15}/></button></span></div>)}<div className="player-row add-row"><input placeholder="Nome do novo atleta" value={newName} onChange={(e)=>setNewName(e.target.value)}/><span/><span/><button className="button button-ghost button-small" onClick={addPlayer} disabled={busy||newName.trim().length<2}><Plus size={15}/> Adicionar</button></div></div></section>;
}

function MatchesPanel({matches,teams,busy,save,updateMatch}:{matches:Match[];teams:Team[];busy:boolean;save:(action:()=>Promise<unknown>,message?:string)=>Promise<void>;updateMatch:(id:string,p:Partial<Match>)=>void}){
  const sorted=useMemo(()=>[...matches].sort((a,b)=>new Date(a.scheduledAt).getTime()-new Date(b.scheduledAt).getTime()),[matches]);
  const [scoreDrafts,setScoreDrafts]=useState<Record<string,string>>(()=>{
    const drafts:Record<string,string>={};
    for(const match of matches){
      for(let index=0;index<3;index+=1){
        for(const side of ["home","away"] as const){
          const score=match.sets[index]?.[side];
          drafts[`${match.id}-${index}-${side}`]=score ? String(score) : "";
        }
      }
    }
    return drafts;
  });

  function updateSet(match:Match,index:number,side:"home"|"away",value:number){
    const sets=[...match.sets];
    while(sets.length<3) sets.push({home:0,away:0});
    sets[index]={...sets[index],[side]:value};
    updateMatch(match.id,{sets});
  }

  function updateScoreDraft(match:Match,index:number,side:"home"|"away",rawValue:string){
    const key=`${match.id}-${index}-${side}`;
    if(rawValue===""){
      setScoreDrafts((current)=>({...current,[key]:""}));
      updateSet(match,index,side,0);
      return;
    }

    const parsed=Number(rawValue);
    if(!Number.isFinite(parsed)) return;
    const score=Math.min(99,Math.max(0,Math.trunc(parsed)));
    setScoreDrafts((current)=>({...current,[key]:String(score)}));
    updateSet(match,index,side,score);
  }

  async function saveMatch(match:Match){
    const lastPlayedSet=match.sets.reduce((last,set,index)=>set.home>0||set.away>0?index:last,-1);
    const effectiveSets=lastPlayedSet>=0?match.sets.slice(0,lastPlayedSet+1):[];
    await save(()=>requestJson(`/api/admin/matches/${match.id}`,{method:"PATCH",body:JSON.stringify({homeTeamId:match.homeTeamId,awayTeamId:match.awayTeamId,scheduledAt:match.scheduledAt,court:match.court,status:match.status,notes:match.notes,sets:effectiveSets})}),"Jogo e classificação atualizados.");
  }

  return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Jogos e placares</h2><p>Informe os pontos de cada set e marque o jogo como encerrado. Campos vazios são salvos como zero.</p></div></div><div className="match-admin-list">{sorted.map((match)=><article className="match-editor" key={match.id}><div className="match-editor-head"><strong>{match.roundLabel} • {phaseLabels[match.phase]}</strong><span>{formatDate(match.scheduledAt)}</span></div><div className="match-edit-grid"><select value={match.homeTeamId??""} onChange={(e)=>updateMatch(match.id,{homeTeamId:e.target.value||null})}><option value="">Equipe a definir</option>{teams.map((t)=><option key={t.id} value={t.id}>{t.code} • {t.name}</option>)}</select><select value={match.awayTeamId??""} onChange={(e)=>updateMatch(match.id,{awayTeamId:e.target.value||null})}><option value="">Equipe a definir</option>{teams.map((t)=><option key={t.id} value={t.id}>{t.code} • {t.name}</option>)}</select><input type="datetime-local" value={localDateTime(match.scheduledAt)} onChange={(e)=>updateMatch(match.id,{scheduledAt:toIsoWithBrazilOffset(e.target.value)})}/><select value={match.status} onChange={(e)=>updateMatch(match.id,{status:e.target.value as Match["status"]})}><option value="scheduled">Agendado</option><option value="live">Ao vivo</option><option value="finished">Encerrado</option><option value="postponed">Adiado</option><option value="cancelled">Cancelado</option></select></div><div className="sets-editor">{[0,1,2].map((index)=><div className="set-editor" key={index}><span>Set {index+1}</span>{(["home","away"] as const).map((side)=><span className="score-side" key={side}>{side==="away"&&<b>×</b>}<input aria-label={`Pontos do ${side==="home"?"mandante":"visitante"} no set ${index+1}`} type="number" inputMode="numeric" min="0" max="99" step="1" placeholder="0" value={scoreDrafts[`${match.id}-${index}-${side}`]??""} onFocus={(e)=>e.currentTarget.select()} onWheel={(e)=>e.currentTarget.blur()} onChange={(e)=>updateScoreDraft(match,index,side,e.target.value)}/></span>)}</div>)}</div><div className="match-editor-actions"><button className="button button-primary button-small" disabled={busy} onClick={()=>saveMatch(match)}><Save size={15}/> Salvar jogo</button></div></article>)}</div></section>;
}

function AdjustmentsPanel({data,busy,save}:{data:TournamentView;busy:boolean;save:(action:()=>Promise<unknown>,message?:string)=>Promise<void>}){
  const initial=Object.fromEntries(data.teams.map((team)=>{const found=data.adjustments.find((a)=>a.teamId===team.id);return[team.id,{points:found?.points??0,reason:found?.reason??""}];}));
  const [values,setValues]=useState(initial);
  async function saveRow(team:Team){const value=values[team.id];await save(()=>requestJson(`/api/admin/standings/${team.id}`,{method:"PUT",body:JSON.stringify(value)}),"Ajuste aplicado à classificação.");}
  return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Ajustes manuais de pontos</h2><p>Use somente para punições, W.O., bônus ou correções. Os placares continuam calculados automaticamente.</p></div></div><div className="adjustment-grid">{data.teams.map((team)=><div className="adjustment-row" key={team.id}><div><strong>{team.code} • {team.name}</strong><small>Grupo {team.groupName}</small></div><input type="number" min="-99" max="99" value={values[team.id]?.points??0} onChange={(e)=>setValues((current)=>({...current,[team.id]:{...current[team.id],points:Number(e.target.value)}}))}/><input className="reason" placeholder="Motivo do ajuste (opcional)" value={values[team.id]?.reason??""} onChange={(e)=>setValues((current)=>({...current,[team.id]:{...current[team.id],reason:e.target.value}}))}/><button className="button button-ghost button-small" disabled={busy} onClick={()=>saveRow(team)}><Save size={14}/> Aplicar</button></div>)}</div></section>;
}

function RulesPanel({rules,busy,save}:{rules:TournamentRules;busy:boolean;save:(action:()=>Promise<unknown>,message?:string)=>Promise<void>}){
  const [values,setValues]=useState(rules); const labels:Record<keyof TournamentRules,string>={format:"Formato das partidas",competition:"Competição",infractions:"Infrações",schedule:"Horários",conduct:"Conduta e fair play",scoring:"Pontuação e desempate"};
  async function submit(event:FormEvent){event.preventDefault();await save(()=>requestJson("/api/admin/rules",{method:"PATCH",body:JSON.stringify(values)}),"Regulamento atualizado.");}
  return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Regulamento</h2><p>Digite uma regra por linha. Linhas vazias serão ignoradas.</p></div></div><form className="form-grid" onSubmit={submit}>{(Object.keys(labels) as (keyof TournamentRules)[]).map((key)=><Field label={labels[key]} key={key}><textarea value={values[key].join("\n")} onChange={(e)=>setValues((current)=>({...current,[key]:e.target.value.split("\n").map((line)=>line.trim()).filter(Boolean)}))}/></Field>)}<div className="form-actions"><button className="button button-primary" disabled={busy}><Save size={16}/> Publicar regulamento</button></div></form></section>;
}
