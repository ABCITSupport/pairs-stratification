###############################################################################
# Pairs Stratification Program.
# Copyright Steve Pomeroy 2026
#
# About box
###############################################################################
import ttkbootstrap as tb
from baseclasses import AppName, AppVersion
from uiparts import UIParts
import webbrowser
from PIL import Image, ImageTk

class about:
    def __init__(self, uiparts: UIParts):
        self.uiparts = uiparts
        uiparts.about = self

    def open_website(self, event):
        webbrowser.open_new("https://github.com/itsthepom/pairs-stratification")

    def open_license(self, event):
        webbrowser.open_new("https://www.gnu.org/licenses/gpl-3.0.html")

    def show(self):
        self.about_win = tb.Toplevel(self.uiparts.root)
        self.about_win.title("About Pairs Stratification")
        self.about_win.iconbitmap("resources\\PairsStratificationAppIco.ico")

        # Define window dimensions
        width = int(self.uiparts.scale_factor * 480)
        height = int(self.uiparts.scale_factor * 360)

        # Calculate x and y coordinates to center on the SCREEN
        screen_width = self.about_win.winfo_screenwidth()
        screen_height = self.about_win.winfo_screenheight()
        
        x = (screen_width // 2) - (width // 2)
        y = (screen_height // 2) - (height // 2)
        
        # Set geometry with offsets: "WIDTHxHEIGHT+X+Y"
        self.about_win.geometry(f"{width}x{height}+{x}+{y}")
        self.about_win.resizable(False, False)

        # Make modal
        self.about_win.transient(self.uiparts.root)
        self.about_win.grab_set()

        # Load PNG image
        # Note: PNG support is built into Tkinter 8.6+ (Python 3.4+)
        original_pil_image = Image.open("resources\\PairsStratificationAbout.png")
        
        # Compute the scaled dimensions based on display scaling
        base_width, base_height = original_pil_image.size
        scaled_width = int(base_width * self.uiparts.scale_factor)
        scaled_height = int(base_height * self.uiparts.scale_factor)

        # Resize using high-quality resampling (LANCZOS)
        resized_pil_image = original_pil_image.resize(
            (scaled_width, scaled_height), 
            Image.Resampling.LANCZOS
        )

        # Convert to PhotoImage for Tkinter
        self.logo_img = ImageTk.PhotoImage(resized_pil_image)

        # Image Label (CRITICAL: Keep a reference so Python's garbage collector doesn't delete it)
        self.logo_label = tb.Label(self.about_win, image=self.logo_img)
        self.logo_label.image = self.logo_img  # Reference retention
        self.logo_label.pack()

        # App Title & Version
        tb.Label(self.about_win, text=AppName, font=("Helvetica", 16, "bold")).pack(pady=2)
        tb.Label(self.about_win, text="Version " + AppVersion, font=("Helvetica", 9)).pack(pady=2)

        # Copyright / license
        tb.Label(self.about_win, text="Copyright Steve Pomeroy 2026", font=("Helvetica", 10)).pack(pady=2)
        license_label = tb.Label(self.about_win, text="Licensed under GPL-3.0", font=("Helvetica", 10, "underline"), cursor="hand2")
        license_label.pack(pady=2)
        license_label.bind("<Button-1>", self.open_license)

        # Clickable Link Label
        link_label = tb.Label(self.about_win, text="Github repository", font=("Helvetica", 10, "underline"), cursor="hand2")
        link_label.pack(pady=2)
        link_label.bind("<Button-1>", self.open_website)

        # Close Button
        tb.Button(self.about_win, text="Close", bootstyle="primary", command=self.close).pack(pady=(15, 15))
        self.about_win.protocol("WM_DELETE_WINDOW", self.close)

    def close(self):
        # Detach the image reference before destroying the window
        if hasattr(self, 'logo_label'):
            self.logo_label.config(image='')
            self.logo_img = None
        self.about_win.destroy()
        pass