UPDATE UserSubscription 
SET credits = credits + 1000 
WHERE id IS NOT NULL 
AND credits < 1000; 