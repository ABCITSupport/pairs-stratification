###############################################################################
# Pairs Stratification Program.
# Copyright Steve Pomeroy 2026
#
# User interface to allow change of auto-assigned ranks
###############################################################################
from baseclasses import baseUIClass
from uiparts import UIParts
import tkinter as tk
import ttkbootstrap as tb
from stratify import UIMPLevels
from autoscroll import AutoScrollbar
from mousewheel import MouseWheel
from coloredcombo import ColoredCombo

class changeRanks(baseUIClass):
    """ Runs a UI to allow the user to change player ranks.

        Args:
            frame(Frame): tkinter Frame to display the UI in.
            tournamentData(tournament): tournamentData instance holding the event data.
            uiparts(UIParts): Holds the UI components.
    """
    def __init__(self, frame: tb.Frame, tournamentData, uiparts: UIParts):
        self.frame = frame
        self.tournamentData = tournamentData
        self.uiparts = uiparts
        uiparts.changeRanksDisplay = self

    def getName(self):
        return 'changeranks'

    def construct(self, pagebgnd):
        self.pagebgnd = pagebgnd

        # Column 0: Canvas (Holds left content; stays at natural content width)
        # Column 1: Right Fixed Frame (Takes ALL remaining space)
        self.frame.grid_rowconfigure(0, weight=1)
        self.frame.grid_columnconfigure(0, weight=0)  # Left content fits naturally
        self.frame.grid_columnconfigure(1, weight=1)  # Right frame fills remaining space

        # Scrollable Canvas Setup
        self.canvas = tk.Canvas(self.frame, highlightthickness=0, bg=self.pagebgnd)
        self.scrollbar = AutoScrollbar(self.frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg=self.pagebgnd)
        self.mousewheel = MouseWheel(self.frame, self.scrollable_frame, self.canvas)

        # Register scrollbar with MouseWheel manager
        self.mousewheel.register_scrollbar(self.scrollbar)

        # Init colored combobox manager
        self.coloredCombo = ColoredCombo(self.scrollable_frame)

        # Create window inside canvas
        canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")

        # Dynamic Scroll Region / Canvas Width Synchronization
        def _update_scroll_region(event=None):
            self.scrollable_frame.update_idletasks()

            # Measure natural content dimensions
            req_width = self.scrollable_frame.winfo_reqwidth()
            req_height = self.scrollable_frame.winfo_reqheight()
            canvas_height = self.canvas.winfo_height()

            # Force canvas to match the width needed by scrollable_frame
            self.canvas.configure(width=req_width)

            # Update scroll region
            bbox = self.canvas.bbox("all")
            if bbox:
                if req_height <= canvas_height:
                    self.canvas.configure(scrollregion=(0, 0, bbox[2], canvas_height))
                    self.canvas.yview_moveto(0)
                else:
                    self.canvas.configure(scrollregion=(0, 0, bbox[2], bbox[3] + self.uiparts.scaling["10"]))

        self.scrollable_frame.bind("<Configure>", _update_scroll_region)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        # Grid placement for left side (Canvas in col 0, Scrollbar over col 0)
        self.canvas.grid(row=0, column=0, sticky="nsew")
        self.scrollbar.grid(row=0, column=0, sticky="nse")

        # Fixed area on the right (Column 1 fills remaining width)
        self.fixed_frame = tk.Frame(self.frame, bg=self.pagebgnd)
        self.fixed_frame.grid(row=0, column=1, sticky="nsew", padx=self.uiparts.scaling["10"], pady=self.uiparts.scaling["5"])

        # Selection trigger
        def on_selection_change(row_name, var):
            self.tournamentData.resultSet.pairData[row_name].masterpointsRankIndex = UIMPLevels.index(var.get())

        self.labels = []

        # Headers inside scrollable frame
        label = tk.Label(self.scrollable_frame, text="#", font=("Segoe UI", 10, "bold"), bg=self.pagebgnd)
        label.grid(row=0, column=0, padx=self.uiparts.scaling["15"], pady=(self.uiparts.scaling["20"], self.uiparts.scaling["5"]), sticky="w")
        self.labels.append(label)

        label = tk.Label(self.scrollable_frame, text="Pair", font=("Segoe UI", 10, "bold"), bg=self.pagebgnd)
        label.grid(row=0, column=1, padx=self.uiparts.scaling["15"], pady=(self.uiparts.scaling["20"], self.uiparts.scaling["5"]), sticky="w")
        self.labels.append(label)

        label = tk.Label(self.scrollable_frame, text="Pair Rank", font=("Segoe UI", 10, "bold"), bg=self.pagebgnd)
        label.grid(row=0, column=2, padx=self.uiparts.scaling["5"], pady=(self.uiparts.scaling["20"], self.uiparts.scaling["5"]), sticky="w")
        self.labels.append(label)

        # Populate Table Rows
        selections = {}
        nspairNumbers, ewpairnumbers = [], []

        for k, v in sorted(self.tournamentData.resultSet.pairData.items()):
            (nspairNumbers if v.isNS else ewpairnumbers).append(k)

        self.traces = []

        for row_number, k in enumerate(nspairNumbers + ewpairnumbers, start=1):
            pair_data = self.tournamentData.resultSet.pairData[k]
            labels_text = [str(k), f"{pair_data.result.player1Name} & {pair_data.result.player2Name}"]

            for col, text in enumerate(labels_text):
                lbl = tk.Label(
                    self.scrollable_frame,
                    text=text,
                    font=("Segoe UI", 10),
                    anchor="w",
                    justify="left",
                    bg=self.pagebgnd
                )
                lbl.grid(row=row_number, column=col, padx=self.uiparts.scaling["15"], sticky="w")
                self.labels.append(lbl)

            initial_val = UIMPLevels[pair_data.masterpointsRankIndex]
            var = tk.StringVar(value=initial_val)
            selections[row_number] = var

            # Right Dropdown / Reset Button
            combobox = self.coloredCombo.create(
                var, row_number, UIMPLevels[::-1],
                UIMPLevels[pair_data.masterpointsRankIndex],
                UIMPLevels[pair_data.origmasterpointsRankIndex]
            )
            self.mousewheel.register_combobox_popdown(combobox)
            self.labels.append(combobox)

            trace_id = var.trace_add("write", lambda *args, p_num=k, v=var: on_selection_change(p_num, v))
            self.traces.append((var, "write", trace_id))

        # Right column instructions
        scaled_wraplength = int(self.uiparts.scale_factor * 300)

        label = tk.Label(self.fixed_frame, text="Change Player Ranks", font=("Segoe UI", 11, "bold"), anchor="w", bg=self.pagebgnd)
        label.grid(row=0, column=0, padx=self.uiparts.scaling["25"], pady=(self.uiparts.scaling["15"], self.uiparts.scaling["5"]), sticky="ew")
        self.labels.append(label)

        instructions = [
            "The list on the left shows the current rank assigned to each pair for stratification.",
            "You can override the ranks by selecting a different rank for any pair.",
            "When you modify a pair's ranks the rank field changes to a different color.",
            "Use the ? icon next to a changed rank to reset it."
        ]

        for idx, text in enumerate(instructions, start=1):
            lbl = tk.Label(
                self.fixed_frame,
                wraplength=scaled_wraplength,
                justify="left",
                font=("Segoe UI", 10),
                text=text,
                anchor="w",
                bg=self.pagebgnd
            )
            lbl.grid(row=idx, column=0, padx=self.uiparts.scaling["25"], sticky="ew")
            self.labels.append(lbl)

        # Buttons (Placed at bottom-right)
        self.backButton = tb.Button(self.frame, text="< Back", bootstyle="primary", width=10, command=self.backPressed)
        self.nextButton = tb.Button(self.frame, text="Next >", bootstyle="primary", width=10, command=self.nextPressed)
        self.labels.append(self.backButton)
        self.labels.append(self.nextButton)

        self.backButton.place(x=self.uiparts.scale_factor * 630, y=self.uiparts.scale_factor * 650)
        self.nextButton.place(x=self.uiparts.scale_factor * 730, y=self.uiparts.scale_factor * 650)
                
    def backPressed(self):
        self.uiparts.root.showPage('select')

    def nextPressed(self):
        self.uiparts.root.showPage('stratify')

    def clearContent(self):
        # Unbind global application events
        if hasattr(self, 'canvas') and self.canvas:
            self.canvas.unbind_all("<MouseWheel>")

        # Destroy the traces
        if hasattr(self, "traces"):
            for var, mode, trace_id in self.traces:
                try:
                    # Remove the observer callback from Tcl/Tk
                    var.trace_remove(mode, trace_id)
                except tk.TclError:
                    # Catch error if variable/interp was already destroyed
                    pass
            self.traces.clear()

        # Destroy the scrollable frame contents
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        self.scrollable_frame.destroy()
        self.scrollbar.destroy()
        self.canvas.destroy()

        # Destroy the fixed frame contents
        for widget in self.fixed_frame.winfo_children():
            widget.destroy()
        self.fixed_frame.destroy()

        # Reset grid weights
        cols, rows = self.frame.grid_size()
        for i in range(cols):
            self.frame.grid_columnconfigure(i, weight=0)
        for i in range(rows):
            self.frame.grid_rowconfigure(i, weight=0)

        # Clear list of widget references
        for label in self.labels:
            label.destroy()
        self.labels.clear()

        # Clean up the ColoredCombo instance
        self.coloredCombo = None
