const openai = require('../config/openai');
const vectorStore = require('../utils/vectorStore');
const { tools, executeTool } = require('../utils/chatbotTools');
const userProfile = require('../data/userProfile.json');
const ChatConversation = require('../models/ChatConversation');

// In-memory cache for active conversations (for performance)
const activeConversations = {};

/**
 * Fallback rule-based responses when OpenAI API is not available
 */
function getFallbackResponse(message) {
  const messageLower = message.toLowerCase();

  // Budget-related
  if (messageLower.includes('budget') || messageLower.includes('budgeting')) {
    return "A great budgeting method is the 50/30/20 rule: allocate 50% of income to needs, 30% to wants, and 20% to savings. Would you like to know more about budgeting strategies?";
  }

  // Savings-related
  if (messageLower.includes('save') || messageLower.includes('saving')) {
    return "Building an emergency fund of 3-6 months of expenses is a great place to start. Even small amounts add up - try automating $25-50 per paycheck. What are you saving for?";
  }

  // Debt-related
  if (messageLower.includes('debt') || messageLower.includes('pay off')) {
    return "For debt repayment, you can use the snowball method (pay smallest debts first for motivation) or avalanche method (pay highest interest first to save money). Which approach interests you?";
  }

  // Spending queries
  if (messageLower.includes('how much') && (messageLower.includes('spent') || messageLower.includes('spend'))) {
    return "I can help you analyze your spending! Try asking: 'How much did I spend on groceries?' or 'Show me my recent transactions.'";
  }

  // Investment-related
  if (messageLower.includes('invest') || messageLower.includes('investing')) {
    return "Start investing early to benefit from compound interest. Consider low-cost index funds and maximize any employer 401(k) match - it's free money! Do you have questions about retirement accounts?";
  }

  // Credit score
  if (messageLower.includes('credit score') || messageLower.includes('credit')) {
    return "Your credit score depends mainly on payment history (35%) and credit utilization (30%). Keep utilization under 30% of your limit and always pay on time. Need tips on improving credit?";
  }

  // Greetings
  if (messageLower.match(/^(hi|hello|hey|greetings)/)) {
    return "Hi! I'm your personal finance assistant. I can help you with budgeting tips, track your spending, answer financial questions, and more. What would you like to know?";
  }

  // Default
  return "I'm here to help with your finances! I can provide advice on budgeting, saving, investing, and debt management. I can also analyze your spending patterns and transactions. What would you like to know?";
}

/**
 * Process chat message with RAG + function calling
 */
const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const user_id = req.userId; // From auth middleware

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({ 
        _id: conversationId, 
        user_id,
        is_active: true 
      });
    }
    
    if (!conversation) {
      // Create new conversation
      conversation = new ChatConversation({
        user_id,
        messages: [],
      });
    }

    // Get conversation history from the conversation document
    const conversationHistory = conversation.messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
      ...(m.tool_calls && { tool_calls: m.tool_calls }),
    }));

    // Search knowledge base for relevant context
    const relevantDocs = await vectorStore.search(message, 2);
    const context = relevantDocs.map(doc => `${doc.title}: ${doc.content}`).join('\n\n');

    // Track if this is a new conversation (no messages yet)
    const isNewConversation = conversation.messages.length === 0;

    // Helper function to save conversation to MongoDB
    const saveConversation = async () => {
      // Generate title from first message if new conversation
      if (isNewConversation) {
        conversation.generateTitle();
      }
      conversation.last_message_at = new Date();
      await conversation.save();
    };

    // Use OpenAI if available, otherwise fallback
    if (openai) {
      try {
        // Add user message to conversation
        conversation.messages.push({
          role: 'user',
          content: message,
        });
        conversationHistory.push({
          role: 'user',
          content: message,
        });

        const userContext = `
USER PROFILE:
- Name: ${userProfile.profile.name}
- Status: ${userProfile.profile.status} at ${userProfile.profile.school}
- Year: ${userProfile.profile.year}, Major: ${userProfile.profile.major}

FINANCIAL SITUATION:
- Monthly Income: $${userProfile.financial_context.monthly_income.total} (Part-time: $${userProfile.financial_context.monthly_income.part_time_job}, Family: $${userProfile.financial_context.monthly_income.family_support}, Aid: $${userProfile.financial_context.monthly_income.financial_aid})
- Monthly Expenses: ~$${userProfile.financial_context.monthly_expenses.total}
- Current Accounts: Student Checking ($842.15), Emergency Savings ($1,250), Student Credit Card ($314.77 balance / $1,000 limit)
- Student Loans: $${userProfile.financial_context.debt.student_loans.total} (deferred until graduation)
- Living: ${userProfile.financial_context.living_situation}
- Work: ${userProfile.financial_context.work_schedule}

GOALS & CONCERNS:
- Emergency fund goal: $${userProfile.financial_context.savings_goals.emergency_fund_target} (currently $${userProfile.financial_context.savings_goals.current_emergency_fund})
- Main concerns: ${userProfile.financial_context.financial_concerns.join(', ')}
`;

        const messages = [
          {
            role: 'system',
            content: `You are a helpful personal finance assistant for college students. You're talking to ${userProfile.profile.name}, a ${userProfile.profile.year} ${userProfile.profile.major} student.

${userContext}

KNOWLEDGE BASE:
${context}

INSTRUCTIONS:
- Be friendly, encouraging, and understanding of student financial challenges
- Provide practical, actionable advice tailored to their situation
- Reference their specific data when relevant (spending patterns, account balances, goals)
- Use available functions to query their transaction data when needed
- Be concise but thorough
- Help them build good financial habits for life after graduation

BUDGET CAPABILITIES:
- Use create_budget to set up new budgets (e.g., "Set a $200 budget for groceries")
- Use get_budget_status to check how they're doing against their budgets
- Use update_budget to modify existing budget amounts
- When users ask about budgets or setting limits, use these tools proactively

You can query transaction data and manage budgets using available functions. Always be supportive and realistic about student budgets.`,
          },
          ...conversationHistory.slice(-10), // Keep last 10 messages
        ];

        // Call OpenAI with function calling
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          tools,
          tool_choice: 'auto',
        });

        const assistantMessage = response.choices[0].message;

        // Handle function calls (may be multiple)
        if (assistantMessage.tool_calls) {
          conversationHistory.push(assistantMessage);

          // Execute all tool calls
          const toolsUsed = [];
          for (const toolCall of assistantMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            toolsUsed.push(functionName);

            // Execute the tool (all tools are now async and need userId for MongoDB queries)
            const functionResponse = await executeTool[functionName](functionArgs, user_id);

            // Add tool response to conversation
            conversationHistory.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(functionResponse),
            });
          }

          // Call OpenAI again with all function results
          const finalResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              messages[0],
              ...conversationHistory.slice(-10),
            ],
          });

          const finalMessage = finalResponse.choices[0].message.content;
          
          // Save assistant response to conversation
          conversation.messages.push({
            role: 'assistant',
            content: finalMessage,
          });
          await saveConversation();

          return res.json({
            message: finalMessage,
            conversationId: conversation._id,
            context_used: relevantDocs.map(d => d.title),
            tools_used: toolsUsed,
          });
        }

        // No function call - save assistant message
        conversation.messages.push({
          role: 'assistant',
          content: assistantMessage.content,
        });
        await saveConversation();

        return res.json({
          message: assistantMessage.content,
          conversationId: conversation._id,
          context_used: relevantDocs.map(d => d.title),
        });
      } catch (openaiError) {
        console.error('OpenAI error, falling back:', openaiError.message);
        // Fall through to fallback response
      }
    }

    // Fallback: Check if message is a data query
    const messageLower = message.toLowerCase();
    let responseMessage = '';

    if (messageLower.includes('spent') || messageLower.includes('spending')) {
      // Try to extract category
      const categories = ['groceries', 'transportation', 'dining', 'entertainment', 'shopping'];
      const foundCategory = categories.find(cat => messageLower.includes(cat));

      if (foundCategory) {
        const result = await executeTool.get_spending_by_category({
          category: foundCategory.charAt(0).toUpperCase() + foundCategory.slice(1),
          days: 30,
        }, user_id);
        if (result.error) {
          responseMessage = `I couldn't fetch your spending data. ${result.error}`;
        } else {
          responseMessage = `You spent $${result.total} on ${result.category} over the past ${result.days} days (${result.transaction_count} transactions).`;
        }
      } else {
        const result = await executeTool.get_spending_by_category({ days: 30 }, user_id);
        if (result.error || !result.categories) {
          responseMessage = `I couldn't fetch your spending data. Try adding some transactions first!`;
        } else {
          const topCategories = result.categories.slice(0, 3);
          responseMessage = topCategories.length > 0
            ? `Here's your spending over the past 30 days:\n${topCategories
                .map(c => `• ${c.category}: $${c.total}`)
                .join('\n')}`
            : `No spending data found for the past 30 days.`;
        }
      }
    } else if (messageLower.includes('balance')) {
      const result = await executeTool.get_account_balance({ account_type: 'all' }, user_id);
      if (result.error || result.message) {
        responseMessage = result.message || `I couldn't fetch your account balances. ${result.error}`;
      } else {
        responseMessage = `Your account balances:\n${result.accounts
          .map(a => `• ${a.name}: $${a.balance}`)
          .join('\n')}`;
      }
    } else if (messageLower.includes('recent') || messageLower.includes('transaction')) {
      const result = await executeTool.get_recent_transactions({ limit: 5 }, user_id);
      if (result.error || result.message) {
        responseMessage = result.message || `I couldn't fetch your transactions. ${result.error}`;
      } else {
        responseMessage = `Your recent transactions:\n${result.transactions
          .map(t => `• ${t.date}: ${t.merchant} - $${t.amount} (${t.category})`)
          .join('\n')}`;
      }
    } else if (context) {
      // Use RAG context
      responseMessage = `${relevantDocs[0].content}\n\nWould you like to know more about this topic?`;
    } else {
      // Use rule-based fallback
      responseMessage = getFallbackResponse(message);
    }

    // Save both messages to conversation
    conversation.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: responseMessage }
    );
    await saveConversation();

    res.json({
      message: responseMessage,
      conversationId: conversation._id,
      context_used: relevantDocs.map(d => d.title),
      mode: 'fallback',
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

/**
 * Get all conversations for a user (for history sidebar)
 */
const getConversations = async (req, res) => {
  try {
    const user_id = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    const conversations = await ChatConversation.find({ 
      user_id, 
      is_active: true 
    })
      .select('_id title last_message_at createdAt')
      .sort({ last_message_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await ChatConversation.countDocuments({ user_id, is_active: true });

    res.json({
      conversations,
      total,
      hasMore: parseInt(offset) + conversations.length < total,
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

/**
 * Get a specific conversation by ID
 */
const getConversation = async (req, res) => {
  try {
    const user_id = req.userId;
    const { conversationId } = req.params;

    const conversation = await ChatConversation.findOne({
      _id: conversationId,
      user_id,
      is_active: true,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversation: {
        _id: conversation._id,
        title: conversation.title,
        messages: conversation.messages.filter(m => m.role !== 'system' && m.role !== 'tool'),
        last_message_at: conversation.last_message_at,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

/**
 * Get conversation history (legacy - returns current session messages)
 */
const getHistory = async (req, res) => {
  try {
    const user_id = req.userId;
    
    // Get the most recent conversation
    const conversation = await ChatConversation.findOne({ 
      user_id, 
      is_active: true 
    }).sort({ last_message_at: -1 });

    if (!conversation) {
      return res.json({
        history: [],
        message_count: 0,
      });
    }

    const history = conversation.messages.filter(msg => msg.role !== 'system' && msg.role !== 'tool');

    res.json({
      history,
      message_count: history.length,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

/**
 * Delete a specific conversation
 */
const deleteConversation = async (req, res) => {
  try {
    const user_id = req.userId;
    const { conversationId } = req.params;

    const result = await ChatConversation.findOneAndUpdate(
      { _id: conversationId, user_id },
      { is_active: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

/**
 * Clear all conversation history for user
 */
const clearHistory = async (req, res) => {
  try {
    const user_id = req.userId;
    
    await ChatConversation.updateMany(
      { user_id },
      { is_active: false }
    );

    res.json({ message: 'All conversations cleared successfully' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversation,
  getHistory,
  deleteConversation,
  clearHistory,
};
