import subprocess

demo_parts = [
    ("rendered_1_hero.png", "demo_audio_1.mp3", "part_demo_1.mp4", 24.41),
    ("rendered_3_satellite_iot.png", "demo_audio_2.mp3", "part_demo_2.mp4", 38.14),
    ("rendered_5_blockchain_subsidies.png", "demo_audio_3.mp3", "part_demo_3.mp4", 29.28),
    ("rendered_9_solana_blockchain.png", "demo_audio_4.mp3", "part_demo_4.mp4", 25.63),
    ("rendered_10_subsidies.png", "demo_audio_5.mp3", "part_demo_5.mp4", 39.65),
    ("rendered_11_subsidies_cert.png", "demo_audio_6.mp3", "part_demo_6.mp4", 19.85),
]

for img, aud, out, dur in demo_parts:
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
    print(f"Rendering {out} ({dur}s)...")
    subprocess.run(cmd, check=True)

with open("demo_concat.txt", "w") as f:
    for _, _, out, _ in demo_parts:
        f.write(f"file '{out}'\n")

concat_cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", "demo_concat.txt",
    "-c", "copy",
    "aquaai_product_demo.mp4"
]
print("Concatenating into aquaai_product_demo.mp4...")
subprocess.run(concat_cmd, check=True)
print("Demo Video generation COMPLETE!")
