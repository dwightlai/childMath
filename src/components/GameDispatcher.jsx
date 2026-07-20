import NumberSenseGame from '../modules/number-sense'
import QuantityRelationGame from '../modules/quantity-relation'
import CalcStrategyGame from '../modules/calc-strategy'
import PatternGame from '../modules/pattern'
import SpatialGame from '../modules/spatial'
import LogicGame from '../modules/logic'
import ProblemSolvingGame from '../modules/problem-solving'
import MathExpressionGame from '../modules/math-expression'
import DataThinkingGame from '../modules/data-thinking'

const COMPONENTS = {
  'number-sense': NumberSenseGame,
  'quantity-relation': QuantityRelationGame,
  'calc-strategy': CalcStrategyGame,
  pattern: PatternGame,
  spatial: SpatialGame,
  logic: LogicGame,
  'problem-solving': ProblemSolvingGame,
  'math-expression': MathExpressionGame,
  'data-thinking': DataThinkingGame,
}

/**
 * GameDispatcher renders the correct game component for a module + game id.
 * Props: moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji,
 *        onFinish, onQuestionResult, questions (optional pre-generated/AI questions)
 */
export default function GameDispatcher({ moduleId, ...rest }) {
  const Comp = COMPONENTS[moduleId]
  if (!Comp) return null
  return <Comp moduleId={moduleId} {...rest} />
}
