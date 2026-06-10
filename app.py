from flask import Flask, render_template, redirect

app = Flask(__name__)

@app.route('/')
def index():
    return redirect('/dashboard')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', active='dashboard')

@app.route('/dashboard/uni')
def uni():
    return render_template('uni.html', active='uni')

@app.route('/dashboard/sport')
def sport():
    return render_template('sport.html', active='sport')

@app.route('/dashboard/projekte')
def projekte():
    return render_template('projekte.html', active='projekte')

@app.route('/dashboard/sprachen')
def sprachen():
    return render_template('sprachen.html', active='sprachen')

@app.route('/dashboard/timetable')
def timetable():
    return render_template('timetable.html', active='timetable')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
