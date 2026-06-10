const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://taqdmkbkzqghcbemocfj.supabase.co";
const supabaseAnonKey = "sb_publishable_nbUKPl44fwWQ8wQaJra5tA_2B7_-J-4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Signing in with test credentials...");
  
  // SignUp a test user
  const email = `test_debug_real_${Date.now()}@gmail.com`; // using gmail to avoid domain block
  const password = "password123";
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) {
    console.error("Auth sign up failed:", authError);
    return;
  }
  
  const user = authData.user;
  if (!user) {
    console.error("No user returned from signup");
    return;
  }
  
  const userId = user.id;
  console.log(`Authenticated. User ID: ${userId}`);

  // This is a real item from stash_db.json
  const realItem = {
    id: "item-1781015621667-728",
    user_id: userId,
    type: "image",
    title: "Man with Sunglasses and Beard",
    description: "The image depicts a man with a short, dark beard and mustache, wearing a pair of gold-framed sunglasses with dark lenses. He has short, dark hair and is dressed in a light orange shirt with small black dots. The man appears to be sitting in front of a metal gate or fence with a decorative design, which serves as the background of the image. His facial expression suggests that he is smiling or laughing.",
    imageUrl: "http://192.168.29.83:3000/uploads/img_1781015634481_99.png",
    sourceUrl: "",
    favicon: "",
    category: "People",
    extractedText: "Imported from gallery",
    summary: "",
    status: "ready",
    createdAt: "2026-06-09T14:33:41.667Z"
  };

  console.log("Attempting to insert real item...");
  const { data, error } = await supabase
    .from('items')
    .insert(realItem);

  if (error) {
    console.error("FAILED to insert real item:", error);
  } else {
    console.log("SUCCESSFULLY inserted real item!");
  }
}

run();
