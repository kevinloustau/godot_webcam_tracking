extends Node3D

@onready var target_cam:Node3D = $TargetCAM

var prev_angle: float
var prev_pos: float

var angle_factor: float = 0.2
var pos_factor: float = 2

func _on_server_new_position(x, y):
	var x_center = (x - 0.5)
	prev_pos = lerp(prev_pos,x_center * pos_factor,0.99)
	prev_angle = lerp(prev_angle,x_center * angle_factor,0.99)
	target_cam.rotation = Vector3(0,prev_angle,0) 
	target_cam.position.x = prev_pos
