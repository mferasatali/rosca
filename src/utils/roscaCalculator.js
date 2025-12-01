/**
 * Calculate monthly distributions for Rosca
 * 
 * @param {Object} groupData - Group configuration
 * @param {number} groupData.totalMonths - Total number of months
 * @param {number} groupData.monthlyAmount - Amount per month per person
 * @param {string} groupData.startMonth - Start month (YYYY-MM format)
 * @param {Array} members - Array of members with {name, roscaCount}
 * @returns {Array} Array of monthly calculations
 */
export const calculateMonthlyDistributions = (groupData, members) => {
  const { totalMonths, monthlyAmount, startMonth } = groupData
  
  // Parse start month
  const startDate = new Date(startMonth + '-01')
  const calculations = []
  
  // Create a map of member IDs to indices for easier lookup
  const memberIdMap = new Map()
  members.forEach((member, index) => {
    const memberId = member.id || `member_${index}`
    memberIdMap.set(memberId, index)
  })
  
  // Calculate for each month
  for (let monthIndex = 0; monthIndex < totalMonths; monthIndex++) {
    const currentDate = new Date(startDate)
    currentDate.setMonth(startDate.getMonth() + monthIndex)
    
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    // Calculate for each member first to get their contributions
    const memberContributions = members.map((member, index) => {
      const memberId = member.id || `member_${index}`
      const amountGiven = monthlyAmount * (member.roscaCount || 1) // Multiply by roscaCount
      
      return {
        memberId: memberId,
        memberName: member.name,
        roscaCount: member.roscaCount,
        amountGiven: amountGiven,
        amountReceived: 0, // Will be updated when receiving member is selected
        amountGivenStatus: false, // Track if member gave this month
        amountGivenDate: null
      }
    })
    
    // Calculate total pot: sum of all members' contributions
    const totalPot = memberContributions.reduce((sum, member) => sum + member.amountGiven, 0)
    
    // Calculate for each month (no automatic receiving member assignment)
    const monthCalculations = {
      month: monthYear,
      monthIndex: monthIndex + 1,
      totalPot,
      receivingMemberId: null, // Will be set manually
      receivingMember: null, // Will be set manually
      members: memberContributions
    }
    
    calculations.push(monthCalculations)
  }
  
  return calculations
}

/**
 * Calculate summary for a member across all months
 */
export const calculateMemberSummary = (calculations, memberId) => {
  const memberCalculations = calculations.flatMap(calc => 
    calc.members.filter(m => m.memberId === memberId)
  )
  
  const totalGiven = memberCalculations.reduce((sum, m) => sum + m.amountGiven, 0)
  const totalReceived = memberCalculations.reduce((sum, m) => sum + m.amountReceived, 0)
  
  return {
    totalGiven,
    totalReceived,
    monthsParticipated: memberCalculations.length
  }
}

