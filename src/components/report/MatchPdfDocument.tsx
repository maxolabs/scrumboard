import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Match, MatchEvent } from '@/lib/types'
import { getSetPieceStats, getObservationNotes, countEvents, eventLabel } from '@/lib/utils'

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  titleBar: { backgroundColor: '#1a1a2e', color: '#fff', padding: 10, textAlign: 'center', marginBottom: 10, borderRadius: 4 },
  titleText: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 8, marginTop: 2 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  col: { flex: 1 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 2 },
  bullet: { marginLeft: 8, marginBottom: 2 },
  bold: { fontWeight: 'bold' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginVertical: 8 },
  fullSection: { marginBottom: 10 },
})

interface Props {
  match: Match
  events: MatchEvent[]
}

export function MatchPdfDocument({ match, events }: Props) {
  const teamName = match.team?.name ?? 'Mi equipo'
  const leftName = match.is_home ? teamName : match.opponent_name
  const rightName = match.is_home ? match.opponent_name : teamName

  const scrumStats = getSetPieceStats(events, 'scrum')
  const lineStats = getSetPieceStats(events, 'lineout')

  const attackNotes = getObservationNotes(events, 'obs_attack')
  const defenseNotes = getObservationNotes(events, 'obs_defense')
  const catchPassNotes = getObservationNotes(events, 'obs_skills_catch_pass')
  const duelNotes = getObservationNotes(events, 'obs_skills_duel')
  const tackleNotes = getObservationNotes(events, 'obs_skills_tackle')
  const ruckNotes = getObservationNotes(events, 'obs_skills_ruck')
  const generalNotes = getObservationNotes(events, 'obs_general')
  const playerObs = events.filter(e => e.category === 'obs_player')

  const penFor = countEvents(events, 'penalty_for')
  const penAgainst = countEvents(events, 'penalty_against')

  const scoringEvents = events.filter(e => e.points > 0)
  const firstHalf = scoringEvents.filter(e => e.half === 'first')
  const secondHalf = scoringEvents.filter(e => e.half === 'second')
  const abbr = teamName.slice(0, 3).toUpperCase()
  const oppAbbr = match.opponent_name.slice(0, 3).toUpperCase()

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Title */}
        <View style={s.titleBar}>
          <Text style={s.titleText}>
            {leftName} {match.home_score} - {match.away_score} {rightName}
          </Text>
          <Text style={s.subtitle}>{match.team?.category} · {match.match_date}</Text>
        </View>

        {/* Attack / Defense */}
        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Ataque</Text>
            {attackNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {attackNotes.length === 0 && <Text style={s.bullet}>—</Text>}
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Defensa</Text>
            {defenseNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {defenseNotes.length === 0 && <Text style={s.bullet}>—</Text>}
          </View>
        </View>

        {/* Obtención: Scrum / Line */}
        <Text style={s.sectionTitle}>Obtención</Text>
        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.bold}>Scrum</Text>
            <Text style={s.bullet}>Tirados: {scrumStats.thrown}</Text>
            <Text style={s.bullet}>Perdidos: {scrumStats.lost}</Text>
            <Text style={s.bullet}>Robados: {scrumStats.stolen}/{scrumStats.stolenTotal}</Text>
            <Text style={s.bullet}>Penales F: {scrumStats.penaltyFor} / C: {scrumStats.penaltyAgainst}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.bold}>Line</Text>
            <Text style={s.bullet}>Tirados: {lineStats.thrown}</Text>
            <Text style={s.bullet}>Perdidos: {lineStats.lost}</Text>
            <Text style={s.bullet}>Robados: {lineStats.stolen}/{lineStats.stolenTotal}</Text>
            <Text style={s.bullet}>Penales F: {lineStats.penaltyFor} / C: {lineStats.penaltyAgainst}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Destrezas */}
        <Text style={s.sectionTitle}>Destrezas</Text>
        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.bold}>Atrapar y Pasar</Text>
            {catchPassNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {catchPassNotes.length === 0 && <Text style={s.bullet}>—</Text>}
            <Text style={[s.bold, { marginTop: 4 }]}>Duelo</Text>
            {duelNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {duelNotes.length === 0 && <Text style={s.bullet}>—</Text>}
          </View>
          <View style={s.col}>
            <Text style={s.bold}>Tackle</Text>
            {tackleNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {tackleNotes.length === 0 && <Text style={s.bullet}>—</Text>}
            <Text style={[s.bold, { marginTop: 4 }]}>Ruck</Text>
            {ruckNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {ruckNotes.length === 0 && <Text style={s.bullet}>—</Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* Observations */}
        {(generalNotes.length > 0 || playerObs.length > 0) && (
          <View style={s.fullSection}>
            <Text style={s.sectionTitle}>Observaciones</Text>
            {generalNotes.map((n, i) => <Text key={i} style={s.bullet}>- {n}</Text>)}
            {playerObs.map((e, i) => (
              <Text key={i} style={s.bullet}>- #{e.player_number}: {e.notes}</Text>
            ))}
          </View>
        )}

        {/* Penalties */}
        <View style={s.fullSection}>
          <Text style={s.sectionTitle}>Penales</Text>
          <Text style={s.bullet}>A favor: {penFor}</Text>
          <Text style={s.bullet}>En contra: {penAgainst}</Text>
        </View>

        {/* Result timeline */}
        <View style={s.fullSection}>
          <Text style={s.sectionTitle}>Resultado</Text>
          <Text style={s.bold}>PT</Text>
          {firstHalf.map((e, i) => (
            <Text key={i} style={s.bullet}>
              {e.match_minute}' {eventLabel(e)} {e.team === 'ours' ? abbr : oppAbbr}
              {e.notes ? ` (${e.notes})` : ''}
            </Text>
          ))}
          {firstHalf.length === 0 && <Text style={s.bullet}>Sin anotaciones</Text>}
          <Text style={[s.bold, { marginTop: 4 }]}>ST</Text>
          {secondHalf.map((e, i) => (
            <Text key={i} style={s.bullet}>
              {e.match_minute}' {eventLabel(e)} {e.team === 'ours' ? abbr : oppAbbr}
              {e.notes ? ` (${e.notes})` : ''}
            </Text>
          ))}
          {secondHalf.length === 0 && <Text style={s.bullet}>Sin anotaciones</Text>}
        </View>

        {/* Propuesta */}
        {match.notes && (
          <View style={s.fullSection}>
            <Text style={s.sectionTitle}>Propuesta</Text>
            <Text>{match.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
