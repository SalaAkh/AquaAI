import subprocess

parts = [
    ("pitch_slide_1.png", "pitch_audio_1.mp3", "part_pitch_1.mp4", 27.02),
    ("pitch_slide_2.png", "pitch_audio_2.mp3", "part_pitch_2.mp4", 39.48),
    ("pitch_slide_3.png", "pitch_audio_3.mp3", "part_pitch_3.mp4", 33.82),
]

for img, aud, out, dur in parts:
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", img,
        "-i", aud,
        "-c:v", "libx264", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-t", str(dur),
        "-shortest",
        out
    ]
    print(f"Rendering {out}...")
    subprocess.run(cmd, check=True)

with open("pitch_concat.txt", "w") as f:
    for _, _, out, _ in parts:
        f.write(f"file '{out}'\n")

concat_cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", "pitch_concat.txt",
    "-c", "copy",
    "aquaai_founder_pitch.mp4"
]
print("Concatenating into aquaai_founder_pitch.mp4...")
subprocess.run(concat_cmd, check=True)
print("Pitch Video generation COMPLETE!")
