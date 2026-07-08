import os
import random
import math
from PIL import Image, ImageDraw

def main():
    image_path = "hero-brain.png"
    output_gif_path = "hero-brain.gif"
    
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found.")
        return
        
    print("Loading base brain mockup image...")
    base_img = Image.open(image_path)
    width, height = base_img.size
    
    # 1. Analyze pixels to find glowing brain pathways
    print("Analyzing image pixels for neural pathways...")
    rgb_img = base_img.convert("RGB")
    bright_pixels = []
    
    for x in range(0, width, 2):
        for y in range(0, height, 2):
            r, g, b = rgb_img.getpixel((x, y))
            # The actual brain fibers are highly saturated neon fibers (max channel value > 150).
            # The background grids and dim halos are very faint (max channel value < 60).
            # We raise the threshold to 120 and add a 10% outer margin boundary check.
            if max(r, g, b) > 120:
                margin_x = width * 0.10
                margin_y = height * 0.10
                if margin_x < x < width - margin_x and margin_y < y < height - margin_y:
                    bright_pixels.append((x, y))
                
    if not bright_pixels:
        print("Error: Could not detect any glowing pathways. Check image brightness.")
        return
        
    print(f"Detected {len(bright_pixels)} path candidate pixels. Sampling nodes...")
    
    # 2. Distribute nodes along the pathways (Poisson-like spacing)
    random.shuffle(bright_pixels)
    nodes = []
    min_distance = 18
    
    for px, py in bright_pixels:
        # Check distance to all existing nodes
        too_close = False
        for nx, ny, _ in nodes:
            if math.hypot(px - nx, py - ny) < min_distance:
                too_close = True
                break
        if not too_close:
            # Assign a color theme based on the pixel's color in the original image
            r, g, b = rgb_img.getpixel((px, py))
            # Determine color class (violet, coral/pink, or cyan)
            if r > 130 and b > 130:
                color = (124, 58, 237) # Violet
            elif r > 130 and g < 120:
                color = (255, 107, 107) # Coral Pink
            else:
                color = (0, 212, 255) # Cyan
                
            nodes.append((px, py, color))
            if len(nodes) >= 140: # Number of nodes
                break
                
    print(f"Generated {len(nodes)} neural nodes. Creating synapses...")
    
    # 3. Create connections (synapses)
    connections = {i: [] for i in range(len(nodes))}
    connect_distance = 55
    
    for i in range(len(nodes)):
        x1, y1, _ = nodes[i]
        for j in range(i + 1, len(nodes)):
            x2, y2, _ = nodes[j]
            if math.hypot(x1 - x2, y1 - y2) < connect_distance:
                connections[i].append(j)
                connections[j].append(i)
                
    # Remove nodes with no connections to prevent stuck signals
    valid_indices = [i for i, conns in connections.items() if len(conns) > 0]
    nodes = [nodes[i] for i in valid_indices]
    
    # Re-build connections dictionary with new indices
    connections = {i: [] for i in range(len(nodes))}
    for i in range(len(nodes)):
        x1, y1, _ = nodes[i]
        for j in range(i + 1, len(nodes)):
            x2, y2, _ = nodes[j]
            if math.hypot(x1 - x2, y1 - y2) < connect_distance:
                connections[i].append(j)
                connections[j].append(i)
                
    print(f"Synapse network complete with {len(nodes)} connected nodes.")
    
    # 4. Neural signals configuration
    num_signals = 30
    signals = []
    
    class Signal:
        def __init__(self):
            self.current_idx = random.randint(0, len(nodes) - 1)
            self.next_idx = random.choice(connections[self.current_idx])
            self.progress = random.random() # randomize start position for seamless loop
            self.speed = 0.03 + random.random() * 0.04
            self.color = nodes[self.current_idx][2]
            
        def update(self):
            self.progress += self.speed
            if self.progress >= 1.0:
                self.progress = 0.0
                self.current_idx = self.next_idx
                # Pick next node
                if connections[self.current_idx]:
                    self.next_idx = random.choice(connections[self.current_idx])
                else:
                    # Fallback reset
                    self.current_idx = random.randint(0, len(nodes) - 1)
                    self.next_idx = random.choice(connections[self.current_idx])
                self.color = nodes[self.current_idx][2]
                
        def get_pos(self):
            x1, y1, _ = nodes[self.current_idx]
            x2, y2, _ = nodes[self.next_idx]
            x = x1 + (x2 - x1) * self.progress
            y = y1 + (y2 - y1) * self.progress
            return x, y
            
    for _ in range(num_signals):
        signals.append(Signal())
        
    # 5. Generate animation frames
    print("Rendering 60 animation frames...")
    frames = []
    num_frames = 60
    
    for f in range(num_frames):
        # Base frame is a copy of our brain mockup
        frame = base_img.copy().convert("RGBA")
        
        # Transparent overlay for glowing elements
        overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Update and draw each signal
        for sig in signals:
            sig.update()
            x, y = sig.get_pos()
            color = sig.color
            
            # Glow layers (draw concentric circles with decreasing alpha)
            # Outer faint glow
            draw.ellipse([x - 10, y - 10, x + 10, y + 10], fill=(color[0], color[1], color[2], 25))
            # Medium glow
            draw.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(color[0], color[1], color[2], 65))
            # Core color
            draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(color[0], color[1], color[2], 180))
            # White hot center
            draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(255, 255, 255, 255))
            
        # Composite overlay onto the base frame
        composited_frame = Image.alpha_composite(frame, overlay)
        # Convert back to RGB/P for GIF output
        frames.append(composited_frame.convert("RGB"))
        
    print("Saving animated GIF...")
    # Save the frames as an animated GIF
    # duration is in milliseconds per frame (40ms = 25fps)
    frames[0].save(
        output_gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=40,
        loop=0,
        optimize=True
    )
    print(f"Success! Animated GIF saved to {output_gif_path}.")

if __name__ == "__main__":
    main()
