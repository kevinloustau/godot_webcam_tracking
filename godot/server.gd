extends Node

signal new_position(x,y)

var socket = WebSocketPeer.new()


func _ready():
	socket.connect_to_url("ws://127.0.0.1:8000")

func _process(delta):
	socket.poll()
	var state = socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN:
		
		while socket.get_available_packet_count():
			var packet = socket.get_packet().get_string_from_utf8() #bytes to string
			var json = JSON.parse_string(packet)
			if (json && typeof(json) == TYPE_DICTIONARY):
				var x = json["xCenter"]
				var y = json["yCenter"]
				new_position.emit(x,y)


	elif state == WebSocketPeer.STATE_CLOSING:
		# Keep polling to achieve proper close.
		pass
	elif state == WebSocketPeer.STATE_CLOSED:
		var code = socket.get_close_code()
		var reason = socket.get_close_reason()
		print("WebSocket closed with code: %d, reason %s. Clean: %s" % [code, reason, code != -1])
		set_process(false) # Stop processing.

