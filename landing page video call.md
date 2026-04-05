# 🎯 1. Core System Design (Updated with Call Queue)

* 1-on-1 video calls only (guest ↔ admin)
* No group calls
* One active call per agent
* **Call queue system**:

  * If agent is busy → guest is added to queue
  * Guests are served in **FIFO order** (first-in, first-out)
  * Notify guests of queue position (“You are #2 in line”)
  * Agent sees **incoming call + queue** for next calls

---

# 🌐 2. Technologies to Use

* WebRTC → video/audio
* Server-Sent Events → signaling (reuse your SSE)
* Google STUN server → NAT traversal (free)

---

# 🔌 3. Signaling System (Backend Responsibilities – Updated)

* Maintain a **call queue** per agent:

  * **Queue array**:

    ```
    queue = [guest1, guest2, guest3...] 
    ```
  * When agent becomes available:

    * Take first guest from queue
    * Send call request
    * Update queue positions
* Create signaling events:

  * call request (only if agent is available, else enqueue)
  * queue position update
  * accept / reject
  * offer / answer
  * ICE candidates
  * call end
* Route messages:

  * guest → agent (or enqueue)
  * agent → guest
* Maintain session state:

  * who is calling
  * who is connected
  * who is waiting in queue

---

# 📱 4. Mobile Compatibility Requirements

* Must run on **HTTPS** (required for camera/mic)
* Support:

  * Android Chrome (works well)
  * iOS Safari (main target) ([SightCall Help Center][1])
* Use **modern WebRTC APIs only** (Safari is strict) ([TechTarget][2])
* Ensure user interaction before starting call (button click)

---

# 🎥 5. Media Handling

* Request:

  * camera access
  * microphone access
* Handle:

  * permission denied
  * no camera/mic available
* Use:

  * front camera (default for mobile)
* Allow:

  * mute/unmute
  * camera on/off

---

# 🔄 6. Call Flow (User Experience – Updated)

## Guest side:

* Click “Video Call”
* Request permissions
* Check agent availability:

  * If agent available → start call
  * If agent busy → join queue
* Show:

  * “Calling…” or “You are #2 in line”
  * Update queue position dynamically
* When agent accepts → start WebRTC connection
* After call ends → next guest automatically served

## Admin side:

* Receive incoming call (if available)
* Show:

  * Accept / Reject
* If accepted → start WebRTC connection
* After call ends:

  * Pop next guest from queue
  * Notify them → new incoming call

---

# 🔗 7. WebRTC Connection Flow

* Create peer connection
* Exchange:

  * SDP offer/answer
  * ICE candidates
* Establish direct P2P connection
* Stream:

  * video
  * audio

---

# ⚠️ 8. Network & Reliability Handling (Updated)

* Guests may leave queue → remove from queue
* If queue is empty → agent becomes idle
* Handle:

  * Queue timeouts (notify guest if too long)
  * Connection failure → requeue guest if needed

---


# 📉 9. Performance Optimization

* Limit video quality (important for mobile)

  * 480p recommended
* Reduce bitrate for weak connections
* Avoid HD by default
* Adapt quality based on connection

---

# 🔌 10. TURN Server (Optional but Important)

* Without TURN:

  * Some users won’t connect (~10–30%)
* With TURN:

  * Much higher success rate

Options:

* Free: none reliable long-term
* Paid: small VPS (~$5–10/month)

---

# 🧠 11. Connection Limits (VERY IMPORTANT)

## Per agent:

* Ideal: 1 call
* Max: 2–3 calls (depends on internet)

## Why:

* Each call = separate video stream
* Upload bandwidth becomes bottleneck

---

# 🧹 12. Cleanup & Resource Management

* Close peer connection after call
* Stop camera/mic tracks
* Clear session state
* Remove SSE listeners
* Prevent memory leaks

---

# 🔐 13. Security

* Require HTTPS
* Validate signaling messages
* Prevent fake call requests
* Add basic rate limiting
* Avoid exposing internal IDs

---

# 📊 14. UI States You Must Handle (Updated)

## Guest:

* idle
* in queue (#1, #2…)
* connecting
* in call
* failed
* ended

## Admin:

* available
* in call
* busy
* queue waiting (show list of guests in line)

---

# 🧪 15. Testing Checklist

Test on:

* Android (Chrome)
* iPhone (Safari)

Test scenarios:

* slow internet
* switching WiFi ↔ data
* denied permissions
* multiple users calling
* reconnect after drop

---

# ⚠️ 16. Known Limitations

* Some mobile users won’t connect (no TURN)
* Calls may drop on weak networks
* iOS Safari is stricter than Chrome ([TechTarget][2])
* WebRTC behavior varies across browsers/devices ([Ant Media][3])

---

# 💡 17. Smart Features (Updated)

* Display queue position to guests
* Notify guest when they reach front of queue
* Optional: estimated wait time
* Retry / cancel button for guests in queue
* Auto fallback to chat if queue is too long or agent unavailable

---

# 🚀 Final Summary (Updated)

You are building:

👉 Lightweight system:

* WebRTC (video)
* SSE (signaling + queue updates)
* STUN only (free)

👉 Features:

* Call queue ensures **1 guest per agent**
* Works on mobile ✅
* 1–2 simultaneous calls per agent ✅
* Guests see queue positions ✅
* No server video load ✅

👉 Tradeoffs:

* Some connection failures
* Queue logic adds slight complexity
* Limited scalability for multiple simultaneous agents without scaling SSE server











