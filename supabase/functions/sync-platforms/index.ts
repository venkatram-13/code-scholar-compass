
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CodeforcesUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
}

interface CodeforcesSubmission {
  problem: {
    name: string;
    rating?: number;
  };
  verdict: string;
  creationTimeSeconds: number;
}

const calculatePlatformScore = (problems: number, rating: number, contests: number, platform: string): number => {
  // Platform-specific scoring logic
  switch (platform.toLowerCase()) {
    case 'codeforces':
      return Math.round((problems * 2) + (rating / 10) + (contests * 5));
    case 'leetcode':
      return Math.round((problems * 1.5) + (rating / 20) + (contests * 8));
    case 'codechef':
      return Math.round((problems * 1.8) + (rating / 15) + (contests * 6));
    default:
      return Math.round((problems * 1.5) + (rating / 15) + (contests * 5));
  }
};

const fetchCodeforcesData = async (handle: string) => {
  try {
    console.log(`Fetching Codeforces data for handle: ${handle}`);
    
    // Fetch user info
    const userResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const userData = await userResponse.json();
    
    if (userData.status !== 'OK') {
      throw new Error(`Codeforces API error: ${userData.comment}`);
    }
    
    const user: CodeforcesUser = userData.result[0];
    
    // Fetch user submissions
    const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const submissionsData = await submissionsResponse.json();
    
    if (submissionsData.status !== 'OK') {
      throw new Error(`Codeforces submissions API error: ${submissionsData.comment}`);
    }
    
    const submissions: CodeforcesSubmission[] = submissionsData.result;
    const solvedProblems = new Set();
    
    // Count unique solved problems
    submissions.forEach(submission => {
      if (submission.verdict === 'OK') {
        solvedProblems.add(`${submission.problem.name}`);
      }
    });
    
    // Get contest participation (rough estimate from submissions)
    const contestIds = new Set();
    submissions.forEach(submission => {
      contestIds.add(Math.floor(submission.creationTimeSeconds / 86400)); // Group by day as proxy for contests
    });
    
    return {
      handle: user.handle,
      current_rating: user.rating || 0,
      max_rating: user.maxRating || 0,
      problems_solved: solvedProblems.size,
      contests_participated: Math.min(contestIds.size, 100), // Cap at reasonable number
    };
  } catch (error) {
    console.error(`Error fetching Codeforces data for ${handle}:`, error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { student_id, platform_name } = await req.json();
    
    console.log(`Syncing data for student: ${student_id}, platform: ${platform_name}`);

    // Get student platform handle
    const { data: studentPlatform, error: platformError } = await supabase
      .from('student_platforms')
      .select(`
        *,
        platform:platforms(*)
      `)
      .eq('student_id', student_id)
      .eq('platform.name', platform_name || 'Codeforces')
      .single();

    if (platformError || !studentPlatform) {
      throw new Error(`Student platform not found: ${platformError?.message}`);
    }

    let platformData;
    
    // Fetch data based on platform
    switch (studentPlatform.platform.name.toLowerCase()) {
      case 'codeforces':
        platformData = await fetchCodeforcesData(studentPlatform.handle);
        break;
      // Add other platforms later
      default:
        throw new Error(`Platform ${studentPlatform.platform.name} not supported yet`);
    }

    // Update student platform data
    const { error: updateError } = await supabase
      .from('student_platforms')
      .update({
        current_rating: platformData.current_rating,
        max_rating: platformData.max_rating,
        problems_solved: platformData.problems_solved,
        contests_participated: platformData.contests_participated,
        last_synced: new Date().toISOString(),
      })
      .eq('id', studentPlatform.id);

    if (updateError) {
      throw new Error(`Failed to update student platform: ${updateError.message}`);
    }

    // Calculate and update platform score
    const score = calculatePlatformScore(
      platformData.problems_solved,
      platformData.current_rating,
      platformData.contests_participated,
      studentPlatform.platform.name
    );

    // Upsert platform score
    const { error: scoreError } = await supabase
      .from('platform_scores')
      .upsert({
        student_id,
        platform_id: studentPlatform.platform_id,
        score,
        problems_solved: platformData.problems_solved,
        avg_rating: platformData.current_rating,
        contests_participated: platformData.contests_participated,
        last_calculated: new Date().toISOString(),
      }, {
        onConflict: 'student_id,platform_id'
      });

    if (scoreError) {
      throw new Error(`Failed to update platform score: ${scoreError.message}`);
    }

    console.log(`Successfully synced data for ${studentPlatform.handle} on ${studentPlatform.platform.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: platformData,
        score 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
