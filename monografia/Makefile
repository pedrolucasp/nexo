JOBNAME  = monografia
LATEX    = pdflatex
BIBTEX   = bibtex
FLAGS    = -interaction=nonstopmode -halt-on-error

.PHONY: all clean distclean

all: $(JOBNAME).pdf

# Full build: tex → bibtex → tex → tex
$(JOBNAME).pdf: $(JOBNAME).tex $(JOBNAME).bib
	$(LATEX) $(FLAGS) $(JOBNAME)
	$(BIBTEX) $(JOBNAME)
	$(LATEX) $(FLAGS) $(JOBNAME)
	$(LATEX) $(FLAGS) $(JOBNAME)

clean:
	rm -f $(JOBNAME).aux \
	      $(JOBNAME).bbl \
	      $(JOBNAME).blg \
	      $(JOBNAME).log \
	      $(JOBNAME).out \
	      $(JOBNAME).toc \
	      $(JOBNAME).lof \
	      $(JOBNAME).lot \
	      $(JOBNAME).lol

distclean: clean
	rm -f $(JOBNAME).pdf

