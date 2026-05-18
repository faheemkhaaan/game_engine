# YouTube Video Script: Building a Custom 2D Game Engine in JavaScript

**Title Ideas:**
- I Built a 2D Game Engine from Scratch (And Almost Broke It)
- How I Optimized My Custom JS Engine from 8 FPS to 60 FPS
- Building a Procedural Dungeon Game Engine in JavaScript

**Tone:** Engaging, technical but accessible, showcasing the journey from failure to success.

---

### [0:00 - 0:45] The Hook & Intro
**Visual:** Fast-paced montage of the engine. Start with the smooth 60fps dungeon, then cut to the horrible 8fps stuttering, then to the SAT collision debug visuals, and finally the boids flocking (even if they are outside the walls).
**Audio (Voiceover):** 
"Building a game engine from scratch is a rite of passage for many developers. So, I decided to build my own 2D JavaScript engine. It started off great... until I added a procedural dungeon generator and my frame rate tanked to an unplayable 8 frames per second. Here is the story of how I built my engine, the math behind the physics, how I accidentally created a garbage-collection nightmare, and how I fixed it to get a silky-smooth 60 FPS."

### [0:45 - 2:30] Act 1: The Foundation & Physics (SAT)
**Visual:** Show the early commits. Simple shapes colliding. Show debug vectors for the Separating Axis Theorem (SAT).
**Audio:** 
"I started with the basics: a rendering system, an input system, and an event manager. But the real challenge was physics. I initially tried simple Axis-Aligned Bounding Boxes (AABB), but it was buggy and limited. I wanted rotating shapes! 

So, I implemented the Separating Axis Theorem, or SAT. It sounds complicated, but the idea is simple: if you can shine a flashlight between two shapes and see a gap in their shadows, they aren't touching. By calculating projection shadows using the dot product, I could accurately detect collisions and even calculate rotational impulse so boxes would spin when hit at an angle. It was beautiful."

### [2:30 - 4:00] Act 2: The Dungeon Generator
**Visual:** Show the dungeon generating. Rooms appearing, hallways carving between them. Show the player spawning in the first room.
**Audio:** 
"With physics working, I needed a world. I wrote a dungeon system that procedurally generates rooms and connects them with hallways. I even added logic to spawn the player right in the very first room. It felt like a real game was coming together. But to make the dungeon interact with the physics, every single wall segment needed to be a physical entity. And that’s when disaster struck."

### [4:00 - 6:00] Act 3: The 8 FPS Nightmare & The Optimization
**Visual:** Show the game lagging horribly at 8 FPS. Then show code snippets of the O(N^2) loop and the `new Vector()` cloning. Show a diagram of the Spatial Grid.
**Audio:** 
"When I spawned a 50-room dungeon, the game crawled to 8 FPS. Why? Because of my collision system. I was checking every single wall and entity against every other wall and entity. It was an O(N^2) time complexity nightmare! On top of that, my math functions were constantly creating new Vectors, forcing JavaScript's Garbage Collector to work overtime and causing massive micro-stutters.

I had to optimize. First, I eliminated vector cloning. I wrote methods to add scaled vectors in-place without creating new objects. Second, I built a Spatial Grid. Instead of checking everything against everything, the engine divides the world into a grid and only checks entities that share the same or adjacent cells. 

The result? I jumped from 8 FPS in a 50-room dungeon to a flawless 60 FPS in a massive 200-room dungeon!"

### [6:00 - 7:30] Act 4: Flocking Boids & The Current Bug
**Visual:** Show the boids simulation. Highlight the bug where they spawn outside the dungeon rooms.
**Audio:** 
"Now that the engine is highly performant, I’m working on my next feature: a Boids simulation for flocking enemy AI. It uses rules like separation, alignment, and cohesion. 

But... game development is never quite finished. Right now, I have a hilarious bug where my boids are spawning completely outside the dungeon rooms. 

*(Show a zoom-in on a boid floating in the void)*

I'm currently working on fixing the spawn boundaries, and next up I'll be merging collinear walls for even more optimization. If you want to see how this engine evolves, hit subscribe, check out the GitHub link in the description, and let me know in the comments how you would fix my boid-spawning bug! Thanks for watching."
